import { DayOfWeek } from './course';

export interface EnrichedClassSchedule {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  facultyId: string;
  facultyName: string;
  section: string;
  day: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  room: string;
  building?: string;
  floor?: number;
  academicYear: string;
  semester: number;
}

export interface NextClassCardData {
  id: string;
  courseCode: string;
  courseTitle: string;
  facultyName: string;
  room: string;
  building: string;
  floor: number;
  section: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  inSession: boolean;
  isToday: boolean;
}
