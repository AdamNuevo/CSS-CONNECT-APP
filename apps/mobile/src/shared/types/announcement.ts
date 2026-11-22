export type AnnouncementAudience = 'all' | 'dean' | 'ccs' | 'org';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  organizationId?: string | null;
  isPinned: boolean;
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
