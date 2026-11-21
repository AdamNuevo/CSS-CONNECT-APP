import { describe, it, expect, vi, beforeEach } from 'vitest';
import { consultationsService } from './consultations.service.js';
import { consultationsRepository } from './consultations.repository.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/app-error.js';

describe('Consultations Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockSlot = {
    id: 'slot-1',
    facultyId: 'fac-1',
    day: 'monday' as const,
    startTime: '09:00',
    endTime: '09:30',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createConsultationRequest', () => {
    it('throws NotFoundError when slot does not exist', async () => {
      vi.spyOn(consultationsRepository, 'findSlotById').mockResolvedValueOnce(null);

      await expect(
        consultationsService.createConsultationRequest('student-1', {
          slotId: 'slot-unknown',
          requestedDate: '2026-11-23', // A Monday
          subject: 'Capstone Inquiry',
          message: 'Need feedback on proposal',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects booking for dates in the past', async () => {
      vi.spyOn(consultationsRepository, 'findSlotById').mockResolvedValueOnce(mockSlot);

      await expect(
        consultationsService.createConsultationRequest('student-1', {
          slotId: mockSlot.id,
          requestedDate: '2020-01-06',
          subject: 'Past Consultation',
          message: 'This should fail',
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('rejects date that does not match the slot day of week', async () => {
      vi.spyOn(consultationsRepository, 'findSlotById').mockResolvedValueOnce(mockSlot);

      // 2026-11-24 is a Tuesday, but mockSlot is Monday
      await expect(
        consultationsService.createConsultationRequest('student-1', {
          slotId: mockSlot.id,
          requestedDate: '2026-11-24',
          subject: 'Wrong Day Test',
          message: 'Slot is Monday, date is Tuesday',
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('throws ConflictError when slot is already booked for that date', async () => {
      vi.spyOn(consultationsRepository, 'findSlotById').mockResolvedValueOnce(mockSlot);
      vi.spyOn(consultationsRepository, 'findActiveBookingsForDate').mockResolvedValueOnce([
        { slotId: mockSlot.id, startTime: '09:00', endTime: '09:30' },
      ]);

      // 2026-11-23 is Monday
      await expect(
        consultationsService.createConsultationRequest('student-1', {
          slotId: mockSlot.id,
          requestedDate: '2026-11-23',
          subject: 'Double Booking Attempt',
          message: 'Should be blocked',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('handles Postgres exclusion constraint race condition error code 23P01', async () => {
      vi.spyOn(consultationsRepository, 'findSlotById').mockResolvedValueOnce(mockSlot);
      vi.spyOn(consultationsRepository, 'findActiveBookingsForDate').mockResolvedValueOnce([]);

      const pgExclusionError: any = new Error('exclusion_violation');
      pgExclusionError.code = '23P01';

      vi.spyOn(consultationsRepository, 'createRequest').mockRejectedValueOnce(pgExclusionError);

      await expect(
        consultationsService.createConsultationRequest('student-1', {
          slotId: mockSlot.id,
          requestedDate: '2026-11-23',
          subject: 'Race Condition Test',
          message: 'Concurrent submission',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('creates consultation request successfully when slot is free', async () => {
      vi.spyOn(consultationsRepository, 'findSlotById').mockResolvedValueOnce(mockSlot);
      vi.spyOn(consultationsRepository, 'findActiveBookingsForDate').mockResolvedValueOnce([]);

      const mockCreated = {
        id: 'req-1',
        studentId: 'student-1',
        facultyId: 'fac-1',
        slotId: mockSlot.id,
        requestedDate: '2026-11-23',
        startTime: '09:00',
        endTime: '09:30',
        subject: 'Valid Request',
        message: 'Valid message body',
        status: 'pending' as const,
        facultyNote: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(consultationsRepository, 'createRequest').mockResolvedValueOnce(mockCreated);

      const result = await consultationsService.createConsultationRequest('student-1', {
        slotId: mockSlot.id,
        requestedDate: '2026-11-23',
        subject: 'Valid Request',
        message: 'Valid message body',
      });

      expect(result.id).toBe('req-1');
      expect(result.status).toBe('pending');
    });
  });

  describe('updateRequestStatus', () => {
    const mockRequest = {
      id: 'req-1',
      studentId: 'student-1',
      facultyId: 'fac-1',
      slotId: 'slot-1',
      requestedDate: '2026-11-23',
      startTime: '09:00',
      endTime: '09:30',
      subject: 'Inquiry',
      message: 'Body',
      status: 'pending' as const,
      facultyNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('allows assigned faculty to approve request with a note', async () => {
      vi.spyOn(consultationsRepository, 'findRequestById').mockResolvedValueOnce(mockRequest);
      vi.spyOn(consultationsRepository, 'updateRequestStatus').mockResolvedValueOnce({
        ...mockRequest,
        status: 'approved',
        facultyNote: 'Approved. See you at faculty room.',
      });

      const updated = await consultationsService.updateRequestStatus(
        { id: 'fac-1', role: 'faculty' },
        'req-1',
        { status: 'approved', facultyNote: 'Approved. See you at faculty room.' }
      );

      expect(updated?.status).toBe('approved');
      expect(updated?.facultyNote).toContain('faculty room');
    });

    it('prevents different faculty from approving another faculty request', async () => {
      vi.spyOn(consultationsRepository, 'findRequestById').mockResolvedValueOnce(mockRequest);

      await expect(
        consultationsService.updateRequestStatus(
          { id: 'fac-different', role: 'faculty' },
          'req-1',
          { status: 'approved' }
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('allows student to cancel their own pending request', async () => {
      vi.spyOn(consultationsRepository, 'findRequestById').mockResolvedValueOnce(mockRequest);
      vi.spyOn(consultationsRepository, 'updateRequestStatus').mockResolvedValueOnce({
        ...mockRequest,
        status: 'cancelled',
      });

      const updated = await consultationsService.updateRequestStatus(
        { id: 'student-1', role: 'student' },
        'req-1',
        { status: 'cancelled' }
      );

      expect(updated?.status).toBe('cancelled');
    });
  });
});
