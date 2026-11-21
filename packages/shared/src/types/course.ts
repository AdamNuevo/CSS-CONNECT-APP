export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  description?: string | null;
  program: string;
  yearLevel: string;
  createdAt: string;
  updatedAt: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface ClassSchedule {
  id: string;
  courseId: string;
  course?: Pick<Course, 'code' | 'title'>;
  facultyId: string;
  section: string;
  day: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  room?: string | null;
  academicYear: string;
  semester: 1 | 2;
}
