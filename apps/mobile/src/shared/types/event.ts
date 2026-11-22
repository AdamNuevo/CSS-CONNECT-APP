export type EventCategory = 'academic' | 'cultural' | 'sports' | 'seminar' | 'org' | 'other';
export type AttendanceStatus = 'registered' | 'attended' | 'absent';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startsAt: string;
  endsAt: string;
  registrationDeadline?: string | null;
  maxSlots?: number | null;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedEvent extends Event {
  registrationCount: number;
  availableSlots: number | null; // null if unlimited
  isRegistered: boolean;
  registrationId?: string | null;
  qrPayload?: string | null;
  attendedAt?: string | null;
  attendanceStatus?: AttendanceStatus | null;
  organizerName?: string | null;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  qrPayload: string;
  attendanceStatus: AttendanceStatus;
  attendedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceValidationResult {
  success: boolean;
  alreadyAttended: boolean;
  message: string;
  event: {
    id: string;
    title: string;
    category: EventCategory;
    location: string;
  };
  attendee: {
    id: string;
    name: string;
    email: string;
    studentNumber?: string | null;
    program?: string | null;
    section?: string | null;
  };
  attendedAt: string;
}

export interface EventAttendee {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber?: string | null;
  studentEmail: string;
  studentProgram?: string | null;
  studentSection?: string | null;
  attendanceStatus: AttendanceStatus;
  attendedAt?: string | null;
  registeredAt: string;
  qrPayload: string;
}

export interface EventReport {
  event: Event;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number; // e.g. 85.5%
  attendees: EventAttendee[];
}
