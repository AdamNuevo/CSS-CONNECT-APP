import { eventsRepository, type EventFilters } from './events.repository.js';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../../errors/app-error.js';
import type {
  CreateEventInput,
  AttendanceValidationResult,
  EventReport,
  EnrichedEvent,
} from '@ccs-hub/shared';

export const eventsService = {
  async getEvents(filters: EventFilters): Promise<EnrichedEvent[]> {
    return eventsRepository.findEvents(filters);
  },

  async getEventById(id: string, userId?: string): Promise<EnrichedEvent> {
    const event = await eventsRepository.findEventById(id, userId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    return event;
  },

  async registerForEvent(userId: string, eventId: string) {
    try {
      const registration = await eventsRepository.register(userId, eventId);
      return registration;
    } catch (err: any) {
      if (err.message === 'EVENT_NOT_FOUND') {
        throw new NotFoundError('Event not found or not published');
      }
      if (err.message === 'REGISTRATION_DEADLINE_PASSED') {
        throw new BadRequestError('The registration deadline for this event has already passed');
      }
      if (err.message === 'EVENT_FULL') {
        throw new ConflictError('This event has reached full capacity. No remaining slots.');
      }
      // PostgreSQL unique constraint violation 23505
      if (err.code === '23505') {
        throw new ConflictError('You have already registered for this event');
      }
      throw err;
    }
  },

  async validateAttendance(
    user: { id: string; role: string },
    qrPayload: string
  ): Promise<AttendanceValidationResult> {
    if (user.role !== 'admin' && user.role !== 'org_officer') {
      throw new ForbiddenError('Only administrators and authorized officers can validate attendance');
    }

    const registration = await eventsRepository.findRegistrationByQrPayload(qrPayload);
    if (!registration) {
      throw new NotFoundError('Invalid ticket QR code or registration not found');
    }

    const attendee = {
      id: registration.userId,
      name: `${registration.userFirstName} ${registration.userLastName}`.trim(),
      email: registration.userEmail,
      studentNumber: registration.studentNumber,
      program: registration.program,
      section: registration.section,
    };

    const event = {
      id: registration.eventId,
      title: registration.eventTitle,
      category: registration.eventCategory as any,
      location: registration.eventLocation,
    };

    // Check if already checked in
    if (registration.attendanceStatus === 'attended') {
      const checkedInTime = registration.attendedAt
        ? new Date(registration.attendedAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'earlier';

      return {
        success: false,
        alreadyAttended: true,
        message: `Already checked in at ${checkedInTime}`,
        event,
        attendee,
        attendedAt: registration.attendedAt ? registration.attendedAt.toISOString() : new Date().toISOString(),
      };
    }

    // Mark as attended
    const updated = await eventsRepository.markAttendance(registration.id);

    return {
      success: true,
      alreadyAttended: false,
      message: 'Check-in successful! Attendance recorded.',
      event,
      attendee,
      attendedAt: updated!.attendedAt!.toISOString(),
    };
  },

  async getEventReport(eventId: string, user: { id: string; role: string }): Promise<EventReport> {
    if (user.role !== 'admin' && user.role !== 'org_officer') {
      throw new ForbiddenError('Only administrators and officers can view event attendance reports');
    }

    const report = await eventsRepository.findEventReport(eventId);
    if (!report) {
      throw new NotFoundError('Event not found');
    }

    return report;
  },

  async getMyRegistrations(userId: string): Promise<EnrichedEvent[]> {
    return eventsRepository.findMyRegistrations(userId);
  },

  async createEvent(input: CreateEventInput, user: { id: string; role: string }) {
    if (user.role !== 'admin' && user.role !== 'org_officer') {
      throw new ForbiddenError('Only administrators and officers can create events');
    }

    const created = await eventsRepository.createEvent({
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null,
      maxSlots: input.maxSlots ?? null,
      createdBy: user.id,
    });

    return created;
  },
};
