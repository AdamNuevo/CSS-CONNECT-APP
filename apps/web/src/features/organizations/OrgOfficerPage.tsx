import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { Organization, OrgMemberDetail } from '@ccs-hub/shared';

const C = {
  navy: '#1E2A78',
  blue: '#2563EB',
  bg: '#F4F5FB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  text: '#111827',
  textSub: '#4B5563',
  textMuted: '#9CA3AF',
  success: '#065F46',
  successBg: '#D1FAE5',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  error: '#991B1B',
  errorBg: '#FEE2E2',
};

interface OrgPendingApp {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  studentNumber?: string | null;
  program?: string | null;
  section?: string | null;
  applicationNote?: string | null;
  appliedAt: string;
}

interface OrgAnnouncement {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  publishedAt?: string;
  createdAt: string;
}

export function OrgOfficerPage() {
  const qc = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'applications' | 'members' | 'announcements'>('applications');

  // Announcement form state
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPinned, setNewPinned] = useState(false);
  const [announceError, setAnnounceError] = useState('');

  // Review modal state
  const [reviewApp, setReviewApp] = useState<OrgPendingApp | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'active' | 'declined'>('active');
  const [reviewNote, setReviewNote] = useState('');

  // 1. Fetch all orgs
  const { data: orgs = [], isLoading: loadingOrgs } = useQuery<Organization[]>({
    queryKey: ['officer-orgs'],
    queryFn: async () => {
      const res = await api.get<{ data: Organization[] }>('/organizations');
      const list = res.data.data;
      if (list.length > 0 && !selectedOrgId) {
        setSelectedOrgId(list[0].id);
      }
      return list;
    },
  });

  const currentOrg = orgs.find((o) => o.id === selectedOrgId) || orgs[0];
  const activeOrgId = currentOrg?.id;

  // 2. Fetch pending applications
  const { data: applications = [], isLoading: loadingApps } = useQuery<OrgPendingApp[]>({
    queryKey: ['org-applications', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await api.get<{ data: OrgPendingApp[] }>(`/organizations/${activeOrgId}/applications`);
      return res.data.data;
    },
    enabled: !!activeOrgId,
  });

  // 3. Fetch active members
  const { data: members = [], isLoading: loadingMembers } = useQuery<OrgMemberDetail[]>({
    queryKey: ['org-members', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await api.get<{ data: OrgMemberDetail[] }>(`/organizations/${activeOrgId}/members`);
      return res.data.data;
    },
    enabled: !!activeOrgId,
  });

  // 4. Fetch announcements
  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery<OrgAnnouncement[]>({
    queryKey: ['org-announcements', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await api.get<{ data: OrgAnnouncement[] }>(`/organizations/${activeOrgId}/announcements`);
      return res.data.data;
    },
    enabled: !!activeOrgId,
  });

  // Mutations
  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!reviewApp || !activeOrgId) return;
      await api.patch(`/organizations/${activeOrgId}/applications/${reviewApp.membershipId}`, {
        status: reviewStatus,
        reviewNote: reviewNote || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-applications', activeOrgId] });
      qc.invalidateQueries({ queryKey: ['org-members', activeOrgId] });
      setReviewApp(null);
      setReviewNote('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      if (!activeOrgId) return;
      await api.delete(`/organizations/${activeOrgId}/members/${membershipId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', activeOrgId] });
    },
  });

  const postAnnounceMutation = useMutation({
    mutationFn: async () => {
      if (!activeOrgId) return;
      await api.post(`/organizations/${activeOrgId}/announcements`, {
        title: newTitle,
        body: newBody,
        isPinned: newPinned,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-announcements', activeOrgId] });
      setNewTitle('');
      setNewBody('');
      setNewPinned(false);
      setAnnounceError('');
    },
    onError: (err: any) => {
      setAnnounceError(err.response?.data?.error?.message || 'Failed to post announcement.');
    },
  });

  const deleteAnnounceMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!activeOrgId) return;
      await api.delete(`/organizations/${activeOrgId}/announcements/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-announcements', activeOrgId] });
    },
  });

  if (loadingOrgs) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSub }}>Loading organizations...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>
            Student Organization Management
          </h2>
          <p style={{ fontSize: 13, color: C.textSub, margin: '4px 0 0 0' }}>
            Review membership applications, manage club roster, and post official org updates
          </p>
        </div>

        {/* Org Selector */}
        {orgs.length > 0 && (
          <select
            value={activeOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${C.borderDark}`,
              fontSize: 13,
              fontWeight: 600,
              color: C.navy,
              backgroundColor: '#fff',
            }}
          >
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.acronym} — {o.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
        {[
          { key: 'applications', label: `Applications (${applications.length})` },
          { key: 'members', label: `Members (${members.length})` },
          { key: 'announcements', label: `Announcements (${announcements.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${C.navy}` : '2px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: 13,
              color: activeTab === tab.key ? C.navy : C.textSub,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content 1: Applications */}
      {activeTab === 'applications' && (
        <div>
          {loadingApps ? (
            <p style={{ color: C.textSub }}>Loading applications...</p>
          ) : applications.length === 0 ? (
            <div style={{ backgroundColor: '#fff', padding: 40, textAlign: 'center', borderRadius: 8, border: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, color: C.textMuted }}>No pending applications for {currentOrg?.acronym}.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fff', borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                    {['Student', 'Program & Sec', 'Applied Date', 'Applicant Note', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: C.textSub }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.membershipId} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: C.text }}>{app.name}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>{app.email}</div>
                      </td>
                      <td style={{ padding: '10px 12px', color: C.textSub }}>
                        {app.program || 'BSCS'} {app.section || ''}
                      </td>
                      <td style={{ padding: '10px 12px', color: C.textSub, whiteSpace: 'nowrap' }}>
                        {new Date(app.appliedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '10px 12px', color: C.textSub, maxWidth: 220 }}>
                        {app.applicationNote || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => {
                            setReviewApp(app);
                            setReviewStatus('active');
                            setReviewNote('');
                          }}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: C.successBg,
                            color: C.success,
                            border: '1px solid #A7F3D0',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginRight: 6,
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setReviewApp(app);
                            setReviewStatus('declined');
                            setReviewNote('');
                          }}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: C.errorBg,
                            color: C.error,
                            border: '1px solid #FECACA',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Content 2: Members */}
      {activeTab === 'members' && (
        <div>
          {loadingMembers ? (
            <p style={{ color: C.textSub }}>Loading members...</p>
          ) : members.length === 0 ? (
            <div style={{ backgroundColor: '#fff', padding: 40, textAlign: 'center', borderRadius: 8, border: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, color: C.textMuted }}>No active members listed.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fff', borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                    {['Name', 'Email', 'Role', 'Program', 'Joined', 'Action'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: C.textSub }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.membershipId} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>{m.name}</td>
                      <td style={{ padding: '10px 12px', color: C.textSub }}>{m.email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: m.role === 'president' ? '#FEF3C7' : m.role === 'officer' ? '#EFF6FF' : '#F3F4F6',
                            color: m.role === 'president' ? '#B45309' : m.role === 'officer' ? '#1D4ED8' : '#374151',
                          }}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: C.textSub }}>{m.program || 'BSCS'}</td>
                      <td style={{ padding: '10px 12px', color: C.textSub, whiteSpace: 'nowrap' }}>
                        {new Date(m.joinedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {m.role === 'member' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${m.name} from the organization?`)) {
                                removeMemberMutation.mutate(m.membershipId);
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: `1px solid ${C.borderDark}`,
                              borderRadius: 4,
                              fontSize: 11,
                              color: C.error,
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Content 3: Announcements */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
          {/* Form */}
          <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.border}`, height: 'fit-content' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: '0 0 12px 0' }}>
              Post Org Announcement
            </h3>
            {announceError && (
              <div style={{ backgroundColor: C.errorBg, color: C.error, padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 10 }}>
                {announceError}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. General Assembly"
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${C.borderDark}`, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>Content</label>
              <textarea
                rows={4}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Details of the announcement..."
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${C.borderDark}`, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="pinCheck"
                checked={newPinned}
                onChange={(e) => setNewPinned(e.target.checked)}
              />
              <label htmlFor="pinCheck" style={{ fontSize: 12, color: C.textSub, cursor: 'pointer' }}>
                Pin this announcement
              </label>
            </div>
            <button
              onClick={() => postAnnounceMutation.mutate()}
              disabled={postAnnounceMutation.isPending || !newTitle || !newBody}
              style={{
                width: '100%',
                padding: 10,
                backgroundColor: C.navy,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                opacity: postAnnounceMutation.isPending || !newTitle || !newBody ? 0.6 : 1,
              }}
            >
              {postAnnounceMutation.isPending ? 'Posting...' : 'Publish Announcement'}
            </button>
          </div>

          {/* List */}
          <div>
            {loadingAnnouncements ? (
              <p style={{ color: C.textSub }}>Loading announcements...</p>
            ) : announcements.length === 0 ? (
              <div style={{ backgroundColor: '#fff', padding: 40, textAlign: 'center', borderRadius: 8, border: `1px solid ${C.border}` }}>
                <p style={{ margin: 0, color: C.textMuted }}>No announcements posted yet for {currentOrg?.acronym}.</p>
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} style={{ backgroundColor: '#fff', borderRadius: 8, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {a.isPinned && (
                          <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: C.warningBg, color: C.warning, padding: '2px 6px', borderRadius: 4 }}>
                            PINNED
                          </span>
                        )}
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy }}>{a.title}</h4>
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        Posted on {new Date(a.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this announcement?')) {
                          deleteAnnounceMutation.mutate(a.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: C.error, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: C.textSub, marginTop: 10, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {a.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewApp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 10, padding: 24, width: '100%', maxWidth: 440 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: C.navy }}>
              {reviewStatus === 'active' ? 'Approve Application' : 'Decline Application'}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: C.textSub }}>
              Student: <strong>{reviewApp.name}</strong> ({reviewApp.email})
            </p>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Feedback / Note to student (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={reviewStatus === 'active' ? 'e.g. Welcome to the committee!' : 'e.g. Requirements incomplete.'}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${C.borderDark}`, fontSize: 13, boxSizing: 'border-box', marginBottom: 16 }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setReviewApp(null)}
                style={{ padding: '8px 16px', backgroundColor: C.bg, border: `1px solid ${C.borderDark}`, borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending}
                style={{
                  padding: '8px 16px',
                  backgroundColor: reviewStatus === 'active' ? C.success : C.error,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {reviewMutation.isPending ? 'Processing...' : `Confirm ${reviewStatus === 'active' ? 'Approval' : 'Decline'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
