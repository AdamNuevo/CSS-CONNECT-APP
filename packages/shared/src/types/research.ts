export interface ResearchStudy {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  keywords: string;
  program: string;
  academicYear: string;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}
