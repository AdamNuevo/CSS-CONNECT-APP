import { api } from './api';
import type {
  EnrichedClassSchedule,
  NextClassCardData,
  StudentEvaluationStatus,
  SubmitEvaluationInput,
  ProfessorWithSlots,
  SlotAvailability,
  ConsultationRequestWithDetails,
  CreateConsultationRequestInput,
  EnrichedEvent,
  EventRegistration,
  Organization,
  MyMembership,
  OrgApplication,
} from '@ccs-hub/shared';

export interface DashboardData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    studentNumber?: string | null;
    employeeNumber?: string | null;
    program?: string | null;
    yearLevel?: string | null;
    section?: string | null;
  } | null;
  nextClass: NextClassCardData | null;
  latestAnnouncements: Array<{
    id: string;
    title: string;
    body: string;
    audience: string;
    isPinned: boolean;
    publishedAt: string | null;
    authorName: string;
    organizationName: string | null;
  }>;
  upcomingEvent: {
    id: string;
    title: string;
    category: string;
    location: string;
    startsAt: string;
    endsAt: string;
    maxSlots: number;
  } | null;
  stats: {
    pendingEvaluations: number;
    termGwa: string | null;
    enrolledUnits: number;
  };
}

export interface AnnouncementsResponse {
  data: Array<{
    id: string;
    title: string;
    body: string;
    audience: string;
    isPinned: boolean;
    publishedAt: string | null;
    authorName: string;
    organizationName: string | null;
  }>;
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface GradesSummaryResponse {
  data: {
    academicYear: string;
    semester: number;
    termGwa: string | null;
    cumulativeGwa: string | null;
    completedUnits: number;
    totalEnrolledUnits: number;
    curriculumRequiredUnits: number;
    curriculumProgressPercent: number;
    courses: Array<{
      courseId: string;
      courseCode: string;
      courseTitle: string;
      units: number;
      prelimGrade: string | null;
      midtermGrade: string | null;
      finalGrade: string | null;
      status: 'passed' | 'failed' | 'in_progress';
    }>;
  };
}

export const mobileApi = {
  async getDashboard(): Promise<DashboardData> {
    const res = await api.get<{ data: DashboardData }>('/home/dashboard');
    return res.data.data;
  },

  async getWeeklySchedule(): Promise<EnrichedClassSchedule[]> {
    const res = await api.get<{ data: EnrichedClassSchedule[] }>('/schedule/weekly');
    return res.data.data;
  },

  async getAnnouncements(audience?: string): Promise<AnnouncementsResponse> {
    const params = audience && audience !== 'all' ? { audience } : {};
    const res = await api.get<AnnouncementsResponse>('/announcements', { params });
    return res.data;
  },

  async getGrades(): Promise<GradesSummaryResponse['data']> {
    const res = await api.get<GradesSummaryResponse>('/grades/my');
    return res.data.data;
  },

  async getEvaluationStatus(): Promise<StudentEvaluationStatus> {
    const res = await api.get<{ data: StudentEvaluationStatus }>('/evaluations/status');
    return res.data.data;
  },

  async submitEvaluation(input: SubmitEvaluationInput): Promise<any> {
    const res = await api.post('/evaluations/submit', input);
    return res.data.data;
  },

  async getProfessors(): Promise<ProfessorWithSlots[]> {
    const res = await api.get<{ data: ProfessorWithSlots[] }>('/consultations/professors');
    return res.data.data;
  },

  async getProfessorAvailability(facultyId: string, date: string): Promise<SlotAvailability[]> {
    const res = await api.get<{ data: SlotAvailability[] }>(
      `/consultations/professors/${facultyId}/availability`,
      { params: { date } }
    );
    return res.data.data;
  },

  async getMyConsultationRequests(status?: string): Promise<ConsultationRequestWithDetails[]> {
    const params = status && status !== 'all' ? { status } : {};
    const res = await api.get<{ data: ConsultationRequestWithDetails[] }>('/consultations/my-requests', {
      params,
    });
    return res.data.data;
  },

  async createConsultationRequest(input: CreateConsultationRequestInput): Promise<any> {
    const res = await api.post('/consultations/requests', input);
    return res.data.data;
  },

  async cancelConsultationRequest(requestId: string): Promise<any> {
    const res = await api.patch(`/consultations/requests/${requestId}/status`, {
      status: 'cancelled',
    });
    return res.data.data;
  },

  async getEvents(): Promise<EnrichedEvent[]> {
    const res = await api.get<{ data: EnrichedEvent[] }>('/events');
    return res.data.data;
  },

  async registerForEvent(eventId: string): Promise<EventRegistration> {
    const res = await api.post<{ data: EventRegistration }>(`/events/${eventId}/register`);
    return res.data.data;
  },

  async getOrganizations(): Promise<Organization[]> {
    const res = await api.get<{ data: Organization[] }>('/organizations');
    return res.data.data;
  },

  async getMyOrganizations(): Promise<MyMembership[]> {
    const res = await api.get<{ data: MyMembership[] }>('/organizations/my');
    return res.data.data;
  },

  async getMyApplications(): Promise<OrgApplication[]> {
    const res = await api.get<{ data: OrgApplication[] }>('/organizations/my-applications');
    return res.data.data;
  },

  async applyToOrganization(orgId: string, applicationNote?: string): Promise<any> {
    const res = await api.post(`/organizations/${orgId}/apply`, { applicationNote });
    return res.data.data;
  },

  async getOrgAnnouncements(orgId: string): Promise<any[]> {
    const res = await api.get<{ data: any[] }>(`/organizations/${orgId}/announcements`);
    return res.data.data;
  },
};

export const dashboardService = mobileApi;
