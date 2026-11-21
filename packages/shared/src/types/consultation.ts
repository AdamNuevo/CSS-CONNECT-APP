import type { DayOfWeek } from './course';

export interface ConsultationSlot {
  id: string;
  facultyId: string;
  day: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM — always 30 min after startTime
  isActive: boolean;
}

export type ConsultationStatus = 'pending' | 'approved' | 'declined' | 'cancelled';

export interface ConsultationRequest {
  id: string;
  studentId: string;
  facultyId: string;
  slotId: string;
  requestedDate: string; // ISO date YYYY-MM-DD
  startTime: string;
  endTime: string;
  subject: string;
  message: string;
  status: ConsultationStatus;
  facultyNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessorWithSlots {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber?: string | null;
  slots: ConsultationSlot[];
}

export interface SlotAvailability {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface ConsultationRequestWithDetails extends ConsultationRequest {
  facultyName: string;
  facultyEmail: string;
  studentName: string;
  studentNumber?: string | null;
  studentProgram?: string | null;
}
