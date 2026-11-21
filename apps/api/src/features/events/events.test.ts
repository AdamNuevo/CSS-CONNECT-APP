import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventsService } from './events.service.js';
import { eventsRepository } from './events.repository.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/app-error.js';

describe('Events Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockEvent = {
    id: 'evt-1',
    title: 'CCS Tech Week Hackathon',
    description: 'Annual 24-hour hackathon for CCS students.',
    category: 'academic' as const,
    location: 'CCS Computer Lab 1 & 2',
    startsAt: '2026-12-01T08:00:00.000Z',
    endsAt: '2026-12-02T08:00:00.000Z',
    registrationDeadline: '2026-11-28T23:59:59.000Z',
    maxSlots: 60,
    isPublished: true,
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    registrationCount: 10,
    availableSlots: 50,
    isRegistered: false,
    registrationId: null,
    qrPayload: null,
    attendedAt: null,
    attendanceStatus: null,
  };

  describe('getEvents & getEventById', () => {
    it('returns list of published events', async () => {
      vi.spyOn(eventsRepository, 'findEvents').mockResolvedValueOnce([mockEvent]);

      const result = await eventsService.getEvents({});
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('CCS Tech Week Hackathon');
      expect(result[0].availableSlots).toBe(50);
    });

    it('throws NotFoundError when event is not found', async () => {
      vi.spyOn(eventsRepository, 'findEventById').mockResolvedValueOnce(null);

      await expect(eventsService.getEventById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('registerForEvent (slot counting & constraints)', () => {
    it('blocks registration when event is full (capacity limit)', async () => {
      vi.spyOn(eventsRepository, 'register').mockRejectedValueOnce(new Error('EVENT_FULL'));

      await expect(
        eventsService.registerForEvent('student-1', 'evt-1')
      ).rejects.toThrow(ConflictError);
    });

    it('blocks registration when registration deadline has passed', async () => {
      vi.spyOn(eventsRepository, 'register').mockRejectedValueOnce(
        new Error('REGISTRATION_DEADLINE_PASSED')
      );

      await expect(
        eventsService.registerForEvent('student-1', 'evt-1')
      ).rejects.toThrow(BadRequestError);
    });

    it('blocks duplicate registration by the same student', async () => {
      const pgUniqueError: any = new Error('unique_violation');
      pgUniqueError.code = '23505';

      vi.spyOn(eventsRepository, 'register').mockRejectedValueOnce(pgUniqueError);

      await expect(
        eventsService.registerForEvent('student-1', 'evt-1')
      ).rejects.toThrow(ConflictError);
    });

    it('generates ticket with personal QR payload upon successful registration', async () => {
      const mockReg = {
        id: 'reg-1',
        eventId: 'evt-1',
        userId: 'student-1',
        qrPayload: 'CCSHUB-EVT-EVT-1-STUDENT-1-TIMESTAMP',
        attendanceStatus: 'registered' as const,
        attendedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(eventsRepository, 'register').mockResolvedValueOnce(mockReg);

      const result = await eventsService.registerForEvent('student-1', 'evt-1');
      expect(result.id).toBe('reg-1');
      expect(result.qrPayload).toContain('CCSHUB-EVT');
      expect(result.attendanceStatus).toBe('registered');
    });
  });

  describe('validateAttendance (web admin attendance scanner)', () => {
    const mockRegRecord = {
      id: 'reg-1',
      eventId: 'evt-1',
      userId: 'student-1',
      qrPayload: 'CCSHUB-EVT-EVT-1-STUDENT-1',
      attendanceStatus: 'registered' as const,
      attendedAt: null,
      createdAt: new Date(),
      eventTitle: 'CCS Tech Week Hackathon',
      eventCategory: 'academic' as const,
      eventLocation: 'CCS Computer Lab 1 & 2',
      eventStartsAt: new Date(),
      userFirstName: 'Angelo',
      userLastName: 'Cruz',
      userEmail: 'angelo.cruz@students.qcu.edu.ph',
      studentNumber: '2024-00001',
      program: 'BSIT',
      section: 'IT-101',
    };

    it('rejects non-admin/officer users from scanning QR codes', async () => {
      await expect(
        eventsService.validateAttendance(
          { id: 'student-1', role: 'student' },
          'CCSHUB-EVT-EVT-1-STUDENT-1'
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('throws NotFoundError for invalid or unregistered QR payload', async () => {
      vi.spyOn(eventsRepository, 'findRegistrationByQrPayload').mockResolvedValueOnce(null);

      await expect(
        eventsService.validateAttendance(
          { id: 'admin-1', role: 'admin' },
          'INVALID-QR-TOKEN'
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('marks attendee as attended on first scan', async () => {
      vi.spyOn(eventsRepository, 'findRegistrationByQrPayload').mockResolvedValueOnce(mockRegRecord);
      vi.spyOn(eventsRepository, 'markAttendance').mockResolvedValueOnce({
        id: 'reg-1',
        eventId: 'evt-1',
        userId: 'student-1',
        qrPayload: 'CCSHUB-EVT-EVT-1-STUDENT-1',
        attendanceStatus: 'attended',
        attendedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await eventsService.validateAttendance(
        { id: 'admin-1', role: 'admin' },
        'CCSHUB-EVT-EVT-1-STUDENT-1'
      );

      expect(result.success).toBe(true);
      expect(result.alreadyAttended).toBe(false);
      expect(result.attendee.name).toBe('Angelo Cruz');
      expect(result.attendee.studentNumber).toBe('2024-00001');
    });

    it('detects and warns if attendee was already checked in', async () => {
      const alreadyCheckedIn = {
        ...mockRegRecord,
        attendanceStatus: 'attended' as const,
        attendedAt: new Date(Date.now() - 600000), // 10 mins ago
      };

      vi.spyOn(eventsRepository, 'findRegistrationByQrPayload').mockResolvedValueOnce(alreadyCheckedIn);

      const result = await eventsService.validateAttendance(
        { id: 'admin-1', role: 'admin' },
        'CCSHUB-EVT-EVT-1-STUDENT-1'
      );

      expect(result.success).toBe(false);
      expect(result.alreadyAttended).toBe(true);
      expect(result.message).toContain('Already checked in');
    });
  });
});
