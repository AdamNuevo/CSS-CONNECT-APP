import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { EnrichedEvent, EventReport, AttendanceValidationResult } from '@ccs-hub/shared';

// ---- shared helper styles --------------------------------------------------

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
  successBorder: '#A7F3D0',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  error: '#991B1B',
  errorBg: '#FEE2E2',
  errorBorder: '#FECACA',
};

function pill(bg: string, text: string, label: string) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        backgroundColor: bg,
        color: text,
      }}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ---- Attendance Scanner page -----------------------------------------------

export function AttendanceScannerPage() {
  const [qrPayload, setQrPayload] = useState('');
  const [result, setResult] = useState<AttendanceValidationResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrPayload.trim()) return;
    setError('');
    setResult(null);
    setIsLoading(true);
    try {
      const res = await api.post<{ data: AttendanceValidationResult }>(
        '/events/attendance/validate',
        { qrPayload: qrPayload.trim() }
      );
      setResult(res.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ?? 'Invalid QR payload or event not found.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQrPayload('');
    setResult(null);
    setError('');
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
        QR Attendance Scanner
      </h2>
      <p style={{ fontSize: 13, color: C.textSub, marginBottom: 24 }}>
        Paste the student's QR payload to mark attendance.
      </p>

      <form onSubmit={handleScan}>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}
          >
            QR Payload
          </label>
          <textarea
            rows={3}
            value={qrPayload}
            onChange={(e) => setQrPayload(e.target.value)}
            placeholder="Paste QR payload here, e.g. CCSHUB-EVT-..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 8,
              border: `1px solid ${C.borderDark}`,
              fontSize: 13,
              fontFamily: 'monospace',
              resize: 'vertical',
              boxSizing: 'border-box',
              color: C.text,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            disabled={isLoading || !qrPayload.trim()}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: C.navy,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              opacity: isLoading || !qrPayload.trim() ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Validating...' : 'Validate QR'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '10px 16px',
              backgroundColor: C.bg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            backgroundColor: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 8,
            color: C.error,
            fontSize: 14,
          }}
        >
          <strong>Invalid QR</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: '16px',
            backgroundColor: result.alreadyAttended ? C.warningBg : C.successBg,
            border: `1px solid ${result.alreadyAttended ? '#FDE68A' : C.successBorder}`,
            borderRadius: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span
              style={{
                fontSize: 20,
                color: result.alreadyAttended ? C.warning : C.success,
              }}
            >
              {result.alreadyAttended ? '⚠' : '✓'}
            </span>
            <strong
              style={{
                fontSize: 15,
                color: result.alreadyAttended ? C.warning : C.success,
              }}
            >
              {result.alreadyAttended ? 'Already Attended' : 'Check-In Successful'}
            </strong>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '12px', fontSize: 13 }}>
            <Row label="Student" value={result.attendee.name} />
            {result.attendee.studentNumber && (
              <Row label="Student No." value={result.attendee.studentNumber} />
            )}
            {result.attendee.program && (
              <Row label="Program" value={result.attendee.program} />
            )}
            {result.attendee.section && (
              <Row label="Section" value={result.attendee.section} />
            )}
            <Row label="Event" value={result.event.title} />
            <Row label="Location" value={result.event.location} />
            <Row label="Check-in Time" value={formatDate(result.attendedAt)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.textSub, fontWeight: 500 }}>{label}</span>
      <span style={{ color: C.text, fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

// ---- Event report modal ----------------------------------------------------

function EventReportModal({
  eventId,
  eventTitle,
  onClose,
}: {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}) {
  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['event-report', eventId],
    queryFn: async () => {
      const res = await api.get<{ data: EventReport }>(`/events/${eventId}/report`);
      return res.data.data;
    },
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: C.surface,
          borderRadius: 12,
          width: '100%',
          maxWidth: 760,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, textTransform: 'uppercase' }}>
              Attendance Report
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{eventTitle}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.textMuted }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
          {isLoading && <p style={{ color: C.textSub }}>Loading report...</p>}
          {isError && <p style={{ color: C.error }}>Failed to load report.</p>}
          {report && (
            <>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Registered', value: report.totalRegistered },
                  { label: 'Total Attended', value: report.totalAttended },
                  { label: 'Attendance Rate', value: `${report.attendanceRate.toFixed(1)}%` },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      backgroundColor: C.bg,
                      borderRadius: 8,
                      padding: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Attendance bar */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    height: 8,
                    backgroundColor: C.border,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${report.attendanceRate}%`,
                      backgroundColor: C.blue,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>

              {/* Attendee table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg }}>
                    {['Name', 'Student No.', 'Program', 'Section', 'Check-in', 'Status'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: C.textSub,
                          borderBottom: `1px solid ${C.border}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.attendees.map((a) => (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '8px 10px', color: C.text, fontWeight: 500 }}>
                        {a.studentName}
                      </td>
                      <td style={{ padding: '8px 10px', color: C.textSub }}>
                        {a.studentNumber ?? '—'}
                      </td>
                      <td style={{ padding: '8px 10px', color: C.textSub }}>
                        {a.studentProgram ?? '—'}
                      </td>
                      <td style={{ padding: '8px 10px', color: C.textSub }}>
                        {a.studentSection ?? '—'}
                      </td>
                      <td style={{ padding: '8px 10px', color: C.textSub, whiteSpace: 'nowrap' }}>
                        {a.attendedAt ? formatDate(a.attendedAt) : '—'}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {a.attendanceStatus === 'attended'
                          ? pill(C.successBg, C.success, 'Attended')
                          : pill(C.warningBg, C.warning, 'Registered')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Create Event form modal ------------------------------------------------

interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  location: string;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  maxSlots: string;
}

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateEventInput>({
    title: '',
    description: '',
    category: 'academic',
    location: '',
    startsAt: '',
    endsAt: '',
    registrationDeadline: '',
    maxSlots: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const field = (k: keyof CreateEventInput) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: `1px solid ${C.borderDark}`,
    fontSize: 13,
    boxSizing: 'border-box',
    color: C.text,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      };
      if (form.registrationDeadline) {
        payload.registrationDeadline = new Date(form.registrationDeadline).toISOString();
      }
      if (form.maxSlots) {
        payload.maxSlots = parseInt(form.maxSlots, 10);
      }
      await api.post('/events', payload);
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Failed to create event.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: C.surface,
          borderRadius: 12,
          width: '100%',
          maxWidth: 540,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Create Event</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.textMuted }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: C.errorBg,
                border: `1px solid ${C.errorBorder}`,
                borderRadius: 6,
                color: C.error,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {[
            { label: 'Title', key: 'title' as const, type: 'text', required: true },
            { label: 'Location', key: 'location' as const, type: 'text', required: true },
          ].map(({ label, key, type, required }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                {label} {required && <span style={{ color: C.error }}>*</span>}
              </label>
              <input type={type} required={required} style={inputStyle} {...field(key)} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Description <span style={{ color: C.error }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              {...field('description')}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Category
            </label>
            <select style={inputStyle} {...field('category')}>
              {['academic', 'cultural', 'sports', 'seminar', 'org', 'other'].map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {[
            { label: 'Starts At', key: 'startsAt' as const, required: true },
            { label: 'Ends At', key: 'endsAt' as const, required: true },
            { label: 'Registration Deadline', key: 'registrationDeadline' as const, required: false },
          ].map(({ label, key, required }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                {label} {required && <span style={{ color: C.error }}>*</span>}
              </label>
              <input type="datetime-local" required={required} style={inputStyle} {...field(key)} />
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              Max Slots <span style={{ color: C.textMuted }}>(leave blank for unlimited)</span>
            </label>
            <input type="number" min="1" style={inputStyle} {...field('maxSlots')} placeholder="e.g. 100" />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: C.navy,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- Event Management page -------------------------------------------------

export function EventManagementPage() {
  const qc = useQueryClient();
  const [reportEvent, setReportEvent] = useState<{ id: string; title: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const res = await api.get<{ data: EnrichedEvent[] }>('/events');
      return res.data.data;
    },
  });

  const handleCreated = () => {
    qc.invalidateQueries({ queryKey: ['admin-events'] });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: 0 }}>Event Management</h2>
          <p style={{ fontSize: 13, color: C.textSub, margin: '4px 0 0 0' }}>
            Create events and view attendance reports.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '9px 18px',
            backgroundColor: C.navy,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          + Create Event
        </button>
      </div>

      {isLoading && (
        <p style={{ color: C.textSub, textAlign: 'center', padding: 40 }}>Loading events...</p>
      )}
      {isError && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: C.error }}>Failed to load events.</p>
          <button onClick={() => refetch()} style={{ marginTop: 8, padding: '8px 16px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {events && events.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: C.textMuted }}>
          No events found. Create one to get started.
        </div>
      )}

      {events && events.map((event) => {
        const utilization =
          event.maxSlots != null
            ? Math.min(100, (event.registrationCount / event.maxSlots) * 100)
            : null;

        return (
          <div
            key={event.id}
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '16px',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      color: C.blue,
                      backgroundColor: '#EFF6FF',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {event.category.toUpperCase()}
                  </span>
                  {!event.isPublished && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.warning,
                        backgroundColor: C.warningBg,
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}
                    >
                      DRAFT
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{event.title}</div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
                  {formatDate(event.startsAt)} · {event.location}
                </div>

                {/* Slot utilization bar */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: C.textSub, marginBottom: 4 }}>
                    {event.registrationCount} registered
                    {event.maxSlots != null ? ` / ${event.maxSlots} slots` : ' (unlimited)'}
                  </div>
                  {utilization !== null && (
                    <div
                      style={{
                        height: 6,
                        backgroundColor: C.border,
                        borderRadius: 3,
                        overflow: 'hidden',
                        maxWidth: 300,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${utilization}%`,
                          backgroundColor: utilization >= 90 ? '#DC2626' : C.blue,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setReportEvent({ id: event.id, title: event.title })}
                style={{
                  padding: '7px 14px',
                  backgroundColor: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: C.navy,
                  whiteSpace: 'nowrap',
                  marginLeft: 12,
                }}
              >
                View Report
              </button>
            </div>
          </div>
        );
      })}

      {reportEvent && (
        <EventReportModal
          eventId={reportEvent.id}
          eventTitle={reportEvent.title}
          onClose={() => setReportEvent(null)}
        />
      )}

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
