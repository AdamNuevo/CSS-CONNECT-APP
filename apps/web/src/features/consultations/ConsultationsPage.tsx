aimport { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface ConsultationRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber?: string | null;
  studentProgram?: string | null;
  requestedDate: string;
  startTime: string;
  endTime: string;
  subject: string;
  message: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  facultyNote?: string | null;
  createdAt: string;
}

interface Slot {
  id?: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string;
  endTime: string;
}

const DAYS: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function ConsultationsPage({
  user,
  onSignOut,
  hideShell = false,
}: {
  user: any;
  onSignOut: () => void;
  hideShell?: boolean;
}) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // Modal state for approving/declining
  const [selectedReq, setSelectedReq] = useState<ConsultationRequest | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'declined'>('approved');
  const [facultyNote, setFacultyNote] = useState('');

  // Weekly availability manager state
  const [newDay, setNewDay] = useState<Slot['day']>('monday');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('09:30');
  const [slotsList, setSlotsList] = useState<Slot[]>([]);
  const [isSlotListInitialized, setIsSlotListInitialized] = useState(false);

  // Queries
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery<ConsultationRequest[]>({
    queryKey: ['faculty-consultations', filter],
    queryFn: async () => {
      const res = await api.get('/consultations/my-requests', {
        params: filter !== 'all' ? { status: filter } : {},
      });
      return res.data.data;
    },
  });

  const { data: facultySlots = [] } = useQuery<Slot[]>({
    queryKey: ['faculty-slots'],
    queryFn: async () => {
      const res = await api.get('/consultations/faculty/my-slots');
      return res.data.data;
    },
  });

  // Sync loaded slots to local state once
  if (facultySlots.length > 0 && !isSlotListInitialized) {
    setSlotsList(facultySlots);
    setIsSlotListInitialized(true);
  }

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
      note,
    }: {
      requestId: string;
      status: 'approved' | 'declined';
      note: string;
    }) => {
      const res = await api.patch(`/consultations/requests/${requestId}/status`, {
        status,
        facultyNote: note.trim() || undefined,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-consultations'] });
      setSelectedReq(null);
      setFacultyNote('');
    },
  });

  const saveSlotsMutation = useMutation({
    mutationFn: async (slots: Slot[]) => {
      const res = await api.put('/consultations/faculty/my-slots', {
        slots: slots.map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      });
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['faculty-slots'] });
      setSlotsList(updated);
      alert('Weekly availability saved successfully.');
    },
  });

  const handleOpenActionModal = (req: ConsultationRequest, type: 'approved' | 'declined') => {
    setSelectedReq(req);
    setActionType(type);
    setFacultyNote('');
  };

  const handleAddSlot = () => {
    setSlotsList([...slotsList, { day: newDay, startTime: newStart, endTime: newEnd }]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlotsList(slotsList.filter((_, i) => i !== index));
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header — hidden when rendered inside PortalLayout which has its own nav */}
      {!hideShell && (
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1E2A78',
            color: '#fff',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#93C5FD' }}>
              CCS Hub Faculty Portal
            </span>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>
              Consultation Management
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#E0E7FF' }}>
              Logged in as Prof. {user.firstName} {user.lastName} ({user.email})
            </p>
          </div>
          <button
            onClick={onSignOut}
            style={{
              backgroundColor: '#DC2626',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Sign Out
          </button>
        </header>
      )}

      {/* Main Grid: Requests and Weekly Availability */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left Column: Requests */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>
              Student Consultation Requests
            </h2>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'pending', 'approved', 'declined'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid #E5E7EB',
                    backgroundColor: filter === f ? '#1E2A78' : '#F9FAFB',
                    color: filter === f ? '#fff' : '#4B5563',
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {isLoadingRequests ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '40px 20px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                color: '#6B7280',
              }}
            >
              No consultation requests found for this filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isDeclined = req.status === 'declined';

                const statusColor = isApproved
                  ? { bg: '#D1FAE5', text: '#065F46' }
                  : isDeclined
                    ? { bg: '#FEE2E2', text: '#991B1B' }
                    : { bg: '#FEF3C7', text: '#B45309' };

                return (
                  <div
                    key={req.id}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #E5E7EB',
                      borderLeft: `4px solid ${isApproved ? '#10B981' : isDeclined ? '#EF4444' : '#F59E0B'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                          {req.studentName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                          {req.studentNumber ? `${req.studentNumber} • ` : ''}
                          {req.studentProgram ?? 'CCS'}
                        </div>
                      </div>
                      <span
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div
                      style={{
                        margin: '12px 0 8px 0',
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '6px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#1E2A78' }}>
                        {req.requestedDate} ({req.startTime} - {req.endTime})
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                      {req.subject}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5, marginBottom: '8px' }}>
                      {req.message}
                    </div>

                    {req.facultyNote && (
                      <div
                        style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          color: '#1E40AF',
                          marginTop: '8px',
                        }}
                      >
                        <strong>Your Note:</strong> {req.facultyNote}
                      </div>
                    )}

                    {isPending && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenActionModal(req, 'declined')}
                          style={{
                            backgroundColor: '#fff',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(req, 'approved')}
                          style={{
                            backgroundColor: '#16A34A',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Weekly Availability Manager */}
        <section>
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #E5E7EB',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>
              Weekly Availability
            </h2>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px 0' }}>
              Set your 30-minute recurring consultation slots for students.
            </p>

            {/* List of Current Slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {slotsList.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>No recurring slots configured yet.</p>
              ) : (
                slotsList.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#F8FAFC',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#1E2A78', textTransform: 'capitalize' }}>{slot.day}:</strong>{' '}
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Slot Form */}
            <div style={{ backgroundColor: '#F1F5F9', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
                Add New 30-Minute Slot
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748B' }}>Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748B' }}>Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => {
                      setNewStart(e.target.value);
                      // Auto calculate 30 min end
                      const [h, m] = e.target.value.split(':').map(Number);
                      const totalMin = h * 60 + m + 30;
                      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
                      const endM = String(totalMin % 60).padStart(2, '0');
                      setNewEnd(`${endH}:${endM}`);
                    }}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddSlot}
                style={{
                  width: '100%',
                  backgroundColor: '#E2E8F0',
                  color: '#1E293B',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                + Add to List
              </button>
            </div>

            <button
              onClick={() => saveSlotsMutation.mutate(slotsList)}
              disabled={saveSlotsMutation.isPending}
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {saveSlotsMutation.isPending ? 'Saving...' : 'Save Availability Schedule'}
            </button>
          </div>
        </section>
      </div>

      {/* Approve / Decline Modal */}
      {selectedReq && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700 }}>
              {actionType === 'approved' ? 'Approve' : 'Decline'} Consultation Request
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6B7280' }}>
              Student: {selectedReq.studentName} • {selectedReq.requestedDate} ({selectedReq.startTime} - {selectedReq.endTime})
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                {actionType === 'approved' ? 'Faculty Note or Location (Optional)' : 'Reason for Declining (Required)'}
              </label>
              <textarea
                rows={3}
                value={facultyNote}
                onChange={(e) => setFacultyNote(e.target.value)}
                placeholder={
                  actionType === 'approved'
                    ? 'e.g. Approved. Please meet at CCS Faculty Lounge Room 102.'
                    : 'e.g. Schedule conflict with department faculty meeting.'
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setSelectedReq(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateStatusMutation.mutate({
                    requestId: selectedReq.id,
                    status: actionType,
                    note: facultyNote,
                  })
                }
                disabled={actionType === 'declined' && !facultyNote.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: actionType === 'approved' ? '#16A34A' : '#DC2626',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Confirm {actionType === 'approved' ? 'Approval' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
