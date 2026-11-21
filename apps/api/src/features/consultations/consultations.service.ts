import { consultationsRepository } from './consultations.repository.js';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../../errors/app-error.js';
import type {
  CreateConsultationRequestInput,
  UpdateConsultationStatusInput,
  SlotAvailability,
  DayOfWeek,
} from '@ccs-hub/shared';

const DAY_NAMES: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getDayOfWeekFromDate(dateStr: string): DayOfWeek | 'sunday' {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayIdx = d.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  if (dayIdx === 0) return 'sunday';
  return DAY_NAMES[dayIdx - 1];
}

export const consultationsService = {
  async getProfessors() {
    return consultationsRepository.findProfessorsWithSlots();
  },

  async getProfessorAvailability(facultyId: string, dateStr: string): Promise<SlotAvailability[]> {
    const dayOfWeek = getDayOfWeekFromDate(dateStr);
    if (dayOfWeek === 'sunday') {
      return [];
    }

    const [allSlots, activeBookings] = await Promise.all([
      consultationsRepository.findProfessorSlots(facultyId),
      consultationsRepository.findActiveBookingsForDate(facultyId, dateStr),
    ]);

    const bookedSlotIds = new Set(activeBookings.map((b) => b.slotId));

    return allSlots
      .filter((s) => s.day === dayOfWeek)
      .map((s) => ({
        id: s.id,
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        isBooked: bookedSlotIds.has(s.id),
      }));
  },

  async createConsultationRequest(studentId: string, input: CreateConsultationRequestInput) {
    const slot = await consultationsRepository.findSlotById(input.slotId);
    if (!slot || !slot.isActive) {
      throw new NotFoundError('Selected consultation slot does not exist or is inactive');
    }

    // Verify date is not in the past
    const todayStr = new Date().toISOString().slice(0, 10);
    if (input.requestedDate < todayStr) {
      throw new BadRequestError('Cannot book a consultation date in the past');
    }

    // Verify requested date corresponds to the slot's weekday
    const requestedDayOfWeek = getDayOfWeekFromDate(input.requestedDate);
    if (requestedDayOfWeek !== slot.day) {
      throw new BadRequestError(
        `The selected date (${input.requestedDate}) falls on a ${requestedDayOfWeek}, but this slot is for ${slot.day}.`
      );
    }

    // Pre-check for existing active booking
    const activeBookings = await consultationsRepository.findActiveBookingsForDate(
      slot.facultyId,
      input.requestedDate
    );
    const isAlreadyBooked = activeBookings.some((b) => b.slotId === slot.id);
    if (isAlreadyBooked) {
      throw new ConflictError('This consultation slot has already been booked for the selected date');
    }

    try {
      const created = await consultationsRepository.createRequest({
        studentId,
        facultyId: slot.facultyId,
        slotId: slot.id,
        requestedDate: input.requestedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: input.subject,
        message: input.message,
      });

      return created;
    } catch (err: any) {
      // Postgres error 23P01 (exclusion_violation) or 23505 (unique_violation)
      if (err.code === '23P01' || err.code === '23505') {
        throw new ConflictError(
          'This consultation slot was just booked by another student. Please select another slot.'
        );
      }
      throw err;
    }
  },

  async getMyRequests(user: { id: string; role: string }, status?: string) {
    if (user.role === 'faculty') {
      return consultationsRepository.findRequestsByFaculty(user.id, status);
    }
    return consultationsRepository.findRequestsByStudent(user.id, status);
  },

  async updateRequestStatus(
    user: { id: string; role: string },
    requestId: string,
    input: UpdateConsultationStatusInput
  ) {
    const request = await consultationsRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Consultation request not found');
    }

    if (user.role === 'faculty' || user.role === 'admin') {
      if (user.role === 'faculty' && request.facultyId !== user.id) {
        throw new ForbiddenError('You can only review consultation requests assigned to you');
      }

      if (input.status === 'cancelled') {
        throw new BadRequestError('Faculty cannot mark a request as cancelled; use declined instead');
      }

      return consultationsRepository.updateRequestStatus(requestId, input.status, input.facultyNote);
    }

    if (user.role === 'student') {
      if (request.studentId !== user.id) {
        throw new ForbiddenError('You can only cancel your own consultation requests');
      }

      if (input.status !== 'cancelled') {
        throw new ForbiddenError('Students can only cancel their consultation requests');
      }

      if (request.status !== 'pending') {
        throw new BadRequestError(`Cannot cancel a consultation request that is already ${request.status}`);
      }

      return consultationsRepository.updateRequestStatus(requestId, 'cancelled');
    }

    throw new ForbiddenError('Unauthorized to update this consultation request');
  },

  async getFacultySlots(facultyId: string) {
    return consultationsRepository.findProfessorSlots(facultyId);
  },

  async setFacultySlots(
    facultyId: string,
    slots: Array<{ day: any; startTime: string; endTime: string }>
  ) {
    return consultationsRepository.setFacultySlots(facultyId, slots);
  },
};
