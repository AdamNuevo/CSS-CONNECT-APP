import { eq, and, sql, desc, ilike, or, count } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { events, eventRegistrations, users } from '../../db/schema/index.js';
import type {
  EnrichedEvent,
  EventReport,
  EventAttendee,
  AttendanceStatus,
} from '@ccs-hub/shared';

export interface EventFilters {
  category?: string;
  search?: string;
  userId?: string;
}

export const eventsRepository = {
  async findEvents(filters: EventFilters): Promise<EnrichedEvent[]> {
    const conditions = [eq(events.isPublished, true)];

    if (filters.category && filters.category !== 'all') {
      conditions.push(eq(events.category, filters.category as any));
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(or(ilike(events.title, term), ilike(events.description, term))!);
    }

    const eventList = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.startsAt);

    if (eventList.length === 0) {
      return [];
    }

    // Get registration counts
    const regCounts = await db
      .select({
        eventId: eventRegistrations.eventId,
        count: count(),
      })
      .from(eventRegistrations)
      .groupBy(eventRegistrations.eventId);

    const countMap = new Map<string, number>();
    for (const r of regCounts) {
      countMap.set(r.eventId, Number(r.count));
    }

    // Get user registrations if logged in
    const userRegMap = new Map<string, typeof eventRegistrations.$inferSelect>();
    if (filters.userId) {
      const userRegs = await db
        .select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.userId, filters.userId));

      for (const reg of userRegs) {
        userRegMap.set(reg.eventId, reg);
      }
    }

    return eventList.map((e) => {
      const regCount = countMap.get(e.id) ?? 0;
      const userReg = userRegMap.get(e.id);
      const availableSlots = e.maxSlots !== null ? Math.max(0, e.maxSlots - regCount) : null;

      return {
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category as any,
        location: e.location,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        registrationDeadline: e.registrationDeadline ? e.registrationDeadline.toISOString() : null,
        maxSlots: e.maxSlots,
        isPublished: e.isPublished,
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        registrationCount: regCount,
        availableSlots,
        isRegistered: !!userReg,
        registrationId: userReg?.id ?? null,
        qrPayload: userReg?.qrPayload ?? null,
        attendedAt: userReg?.attendedAt ? userReg.attendedAt.toISOString() : null,
        attendanceStatus: userReg?.attendanceStatus ?? null,
      };
    });
  },

  async findEventById(id: string, userId?: string): Promise<EnrichedEvent | null> {
    const [e] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!e) return null;

    const [regCountRow] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, id));

    const regCount = Number(regCountRow?.count ?? 0);
    const availableSlots = e.maxSlots !== null ? Math.max(0, e.maxSlots - regCount) : null;

    let userReg: typeof eventRegistrations.$inferSelect | undefined;
    if (userId) {
      const [r] = await db
        .select()
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, userId)))
        .limit(1);
      userReg = r;
    }

    return {
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category as any,
      location: e.location,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt.toISOString(),
      registrationDeadline: e.registrationDeadline ? e.registrationDeadline.toISOString() : null,
      maxSlots: e.maxSlots,
      isPublished: e.isPublished,
      createdBy: e.createdBy,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      registrationCount: regCount,
      availableSlots,
      isRegistered: !!userReg,
      registrationId: userReg?.id ?? null,
      qrPayload: userReg?.qrPayload ?? null,
      attendedAt: userReg?.attendedAt ? userReg.attendedAt.toISOString() : null,
      attendanceStatus: userReg?.attendanceStatus ?? null,
    };
  },

  async register(userId: string, eventId: string) {
    // Transaction with row locking on events ensures slot counting without overselling
    return db.transaction(async (tx) => {
      // 1. Lock the event record
      const [e] = await tx
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .for('update');

      if (!e) {
        throw new Error('EVENT_NOT_FOUND');
      }

      if (e.registrationDeadline && new Date() > new Date(e.registrationDeadline)) {
        throw new Error('REGISTRATION_DEADLINE_PASSED');
      }

      // 2. Count existing registrations
      const [regCountResult] = await tx
        .select({ value: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));

      const currentCount = Number(regCountResult?.value ?? 0);

      if (e.maxSlots !== null && currentCount >= e.maxSlots) {
        throw new Error('EVENT_FULL');
      }

      // 3. Generate QR Payload
      const qrPayload = `CCSHUB-EVT-${eventId.slice(0, 8)}-${userId.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

      // 4. Insert registration
      const [registration] = await tx
        .insert(eventRegistrations)
        .values({
          eventId,
          userId,
          qrPayload,
          attendanceStatus: 'registered',
        })
        .returning();

      return registration;
    });
  },

  async findRegistrationByQrPayload(qrPayload: string) {
    const [row] = await db
      .select({
        id: eventRegistrations.id,
        eventId: eventRegistrations.eventId,
        userId: eventRegistrations.userId,
        qrPayload: eventRegistrations.qrPayload,
        attendanceStatus: eventRegistrations.attendanceStatus,
        attendedAt: eventRegistrations.attendedAt,
        createdAt: eventRegistrations.createdAt,
        eventTitle: events.title,
        eventCategory: events.category,
        eventLocation: events.location,
        eventStartsAt: events.startsAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        studentNumber: users.studentNumber,
        program: users.program,
        section: users.section,
      })
      .from(eventRegistrations)
      .innerJoin(events, eq(eventRegistrations.eventId, events.id))
      .innerJoin(users, eq(eventRegistrations.userId, users.id))
      .where(or(eq(eventRegistrations.qrPayload, qrPayload), eq(eventRegistrations.id, qrPayload as any)))
      .limit(1);

    return row ?? null;
  },

  async markAttendance(registrationId: string) {
    const [updated] = await db
      .update(eventRegistrations)
      .set({
        attendanceStatus: 'attended',
        attendedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(eventRegistrations.id, registrationId))
      .returning();

    return updated;
  },

  async findEventReport(eventId: string): Promise<EventReport | null> {
    const [e] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!e) return null;

    const attendees = await db
      .select({
        id: eventRegistrations.id,
        studentId: users.id,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentNumber: users.studentNumber,
        studentEmail: users.email,
        studentProgram: users.program,
        studentSection: users.section,
        attendanceStatus: eventRegistrations.attendanceStatus,
        attendedAt: eventRegistrations.attendedAt,
        registeredAt: eventRegistrations.createdAt,
        qrPayload: eventRegistrations.qrPayload,
      })
      .from(eventRegistrations)
      .innerJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.createdAt));

    const totalRegistered = attendees.length;
    const totalAttended = attendees.filter((a) => a.attendanceStatus === 'attended').length;
    const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    return {
      event: {
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category as any,
        location: e.location,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        registrationDeadline: e.registrationDeadline ? e.registrationDeadline.toISOString() : null,
        maxSlots: e.maxSlots,
        isPublished: e.isPublished,
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      },
      totalRegistered,
      totalAttended,
      attendanceRate,
      attendees: attendees.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        studentName: `${a.studentFirstName} ${a.studentLastName}`.trim(),
        studentNumber: a.studentNumber,
        studentEmail: a.studentEmail,
        studentProgram: a.studentProgram,
        studentSection: a.studentSection,
        attendanceStatus: a.attendanceStatus as AttendanceStatus,
        attendedAt: a.attendedAt ? a.attendedAt.toISOString() : null,
        registeredAt: a.registeredAt.toISOString(),
        qrPayload: a.qrPayload,
      })),
    };
  },

  async findMyRegistrations(userId: string): Promise<EnrichedEvent[]> {
    const rows = await db
      .select({
        event: events,
        registration: eventRegistrations,
      })
      .from(eventRegistrations)
      .innerJoin(events, eq(eventRegistrations.eventId, events.id))
      .where(eq(eventRegistrations.userId, userId))
      .orderBy(desc(events.startsAt));

    return rows.map((r) => ({
      id: r.event.id,
      title: r.event.title,
      description: r.event.description,
      category: r.event.category as any,
      location: r.event.location,
      startsAt: r.event.startsAt.toISOString(),
      endsAt: r.event.endsAt.toISOString(),
      registrationDeadline: r.event.registrationDeadline ? r.event.registrationDeadline.toISOString() : null,
      maxSlots: r.event.maxSlots,
      isPublished: r.event.isPublished,
      createdBy: r.event.createdBy,
      createdAt: r.event.createdAt.toISOString(),
      updatedAt: r.event.updatedAt.toISOString(),
      registrationCount: 0,
      availableSlots: null,
      isRegistered: true,
      registrationId: r.registration.id,
      qrPayload: r.registration.qrPayload,
      attendedAt: r.registration.attendedAt ? r.registration.attendedAt.toISOString() : null,
      attendanceStatus: r.registration.attendanceStatus as any,
    }));
  },

  async createEvent(data: {
    title: string;
    description: string;
    category: any;
    location: string;
    startsAt: Date;
    endsAt: Date;
    registrationDeadline?: Date | null;
    maxSlots?: number | null;
    createdBy: string;
  }) {
    const [created] = await db
      .insert(events)
      .values({
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        registrationDeadline: data.registrationDeadline ?? null,
        maxSlots: data.maxSlots ?? null,
        isPublished: true,
        createdBy: data.createdBy,
      })
      .returning();

    return created;
  },
};
