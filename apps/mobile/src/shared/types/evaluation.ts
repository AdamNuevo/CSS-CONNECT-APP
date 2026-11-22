export interface EvaluationCriterion {
  id: string;
  label: string;
  description: string;
}

export const EVALUATION_CRITERIA: EvaluationCriterion[] = [
  {
    id: 'mastery',
    label: 'Subject Matter Mastery',
    description: 'Demonstrates deep knowledge and clear understanding of the subject matter.',
  },
  {
    id: 'pedagogy',
    label: 'Teaching Methodology',
    description: 'Explains concepts clearly and uses effective instructional materials.',
  },
  {
    id: 'management',
    label: 'Classroom Management',
    description: 'Starts and ends classes on time, maintains an orderly learning environment.',
  },
  {
    id: 'professionalism',
    label: 'Professionalism & Respect',
    description: 'Treats students fairly and demonstrates professional conduct at all times.',
  },
];

export interface EvaluationPeriodInfo {
  id: string;
  academicYear: string;
  semester: number;
  label: string;
  opensAt: string;
  closesAt: string;
}

export interface FacultyEvaluationItem {
  facultyId: string;
  facultyName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  section: string;
  isSubmitted: boolean;
  submittedAt?: string | null;
}

export interface StudentEvaluationStatus {
  isActive: boolean;
  period: EvaluationPeriodInfo | null;
  items: FacultyEvaluationItem[];
  completedCount: number;
  totalCount: number;
}
