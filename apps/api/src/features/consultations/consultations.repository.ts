import { eq, and, sql, notInArray, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  consultationSlots,
  consultationRequests,
  users,
} from '../../db/schema/index.js';
import type {
  ConsultationSlot,
  ProfessorWithSlots,
  ConsultationRequestWithDetails,
} from '@ccs-hub/shared';

export const consultationsRepository = {
  async findProfessorsWithSlots(): Promise<ProfessorWithSlots[]> {
    const facultyUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        employeeNumber: users.employeeNumber,
      })
      .from(users)
      .where(and(eq(users.role, 'faculty'), eq(users.isActive, true)))
      .orderBy(users.lastName, users.firstName);

    const slots = await db
      .select()
      .from(consultationSlots)
      .where(eq(consultationSlots.isActive, true))
      .orderBy(consultationSlots.startTime);

    return facultyUsers.map((f) => ({
      id: f.id,
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      employeeNumber: f.employeeNumber,
      slots: slots
        .filter((s) => s.facultyId === f.id)
        .map((s) => ({
          id: s.id,
          facultyId: s.facultyId,
          day: s.day as any,
          startTime: s.startTime.slice(0, 5),
          endTime: s.endTime.slice(0, 5),
          isActive: s.isActive,
        })),
    }));
  },

  async findProfessorSlots(facultyId: string): Promise<ConsultationSlot[]> {
    const slots = await db
      .select()
      .from(consultationSlots)
      .where(
        and(
          eq(consultationSlots.facultyId, facultyId),
          eq(consultationSlots.isActive, true)
        )
      )
      .orderBy(consultationSlots.startTime);

    return slots.map((s) => ({
      id: s.id,
      facultyId: s.facultyId,
      day: s.day as any,
      startTime: s.startTime.slice(0, 5),
      endTime: s.endTime.slice(0, 5),
      isActive: s.isActive,
    }));
  },

  async findSlotById(slotId: string) {
    const [slot] = await db
      .select()
      .from(consultationSlots)
      .where(eq(consultationSlots.id, slotId))
      .limit(1);

    return slot ?? null;
  },

  async findActiveBookingsForDate(facultyId: string, requestedDate: string) {
    const rows = await db
      .select({
        slotId: consultationRequests.slotId,
        startTime: consultationRequests.startTime,
        endTime: consultationRequests.endTime,
      })
      .from(consultationRequests)
      .where(
        and(
          eq(consultationRequests.facultyId, facultyId),
          eq(consultationRequests.requestedDate, requestedDate),
          notInArray(consultationRequests.status, ['declined', 'cancelled'])
        )
      );

    return rows;
  },

  async createRequest(data: {
    studentId: string;
    facultyId: string;
    slotId: string;
    requestedDate: string;
    startTime: string;
    endTime: string;
    subject: string;
    message: string;
  }) {
    const [created] = await db
      .insert(consultationRequests)
      .values({
        studentId: data.studentId,
        facultyId: data.facultyId,
        slotId: data.slotId,
        requestedDate: data.requestedDate,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: data.subject,
        message: data.message,
        status: 'pending',
      })
      .returning();

    return created;
  },

  async findRequestsByStudent(
    studentId: string,
    status?: string
  ): Promise<ConsultationRequestWithDetails[]> {
    const conditions = [eq(consultationRequests.studentId, studentId)];
    if (status && status !== 'all') {
      conditions.push(eq(consultationRequests.status, status as any));
    }

    const rows = await db
      .select({
        id: consultationRequests.id,
        studentId: consultationRequests.studentId,
        facultyId: consultationRequests.facultyId,
        slotId: consultationRequests.slotId,
        requestedDate: consultationRequests.requestedDate,
        startTime: consultationRequests.startTime,
        endTime: consultationRequests.endTime,
        subject: consultationRequests.subject,
        message: consultationRequests.message,
        status: consultationRequests.status,
        facultyNote: consultationRequests.facultyNote,
        createdAt: consultationRequests.createdAt,
        updatedAt: consultationRequests.updatedAt,
        facultyFirstName: users.firstName,
        facultyLastName: users.lastName,
        facultyEmail: users.email,
      })
      .from(consultationRequests)
      .innerJoin(users, eq(consultationRequests.facultyId, users.id))
      .where(and(...conditions))
      .orderBy(desc(consultationRequests.requestedDate), desc(consultationRequests.startTime));

    return rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      facultyId: r.facultyId,
      slotId: r.slotId,
      requestedDate: r.requestedDate,
      startTime: r.startTime.slice(0, 5),
      endTime: r.endTime.slice(0, 5),
      subject: r.subject,
      message: r.message,
      status: r.status as any,
      facultyNote: r.facultyNote,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      facultyName: `Prof. ${r.facultyFirstName} ${r.facultyLastName}`.trim(),
      facultyEmail: r.facultyEmail,
      studentName: '',
    }));
  },

  async findRequestsByFaculty(
    facultyId: string,
    status?: string
  ): Promise<ConsultationRequestWithDetails[]> {
    const conditions = [eq(consultationRequests.facultyId, facultyId)];
    if (status && status !== 'all') {
      conditions.push(eq(consultationRequests.status, status as any));
    }

    const rows = await db
      .select({
        id: consultationRequests.id,
        studentId: consultationRequests.studentId,
        facultyId: consultationRequests.facultyId,
        slotId: consultationRequests.slotId,
        requestedDate: consultationRequests.requestedDate,
        startTime: consultationRequests.startTime,
        endTime: consultationRequests.endTime,
        subject: consultationRequests.subject,
        message: consultationRequests.message,
        status: consultationRequests.status,
        facultyNote: consultationRequests.facultyNote,
        createdAt: consultationRequests.createdAt,
        updatedAt: consultationRequests.updatedAt,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentNumber: users.studentNumber,
        studentProgram: users.program,
        studentEmail: users.email,
      })
      .from(consultationRequests)
      .innerJoin(users, eq(consultationRequests.studentId, users.id))
      .where(and(...conditions))
      .orderBy(desc(consultationRequests.requestedDate), desc(consultationRequests.startTime));

    return rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      facultyId: r.facultyId,
      slotId: r.slotId,
      requestedDate: r.requestedDate,
      startTime: r.startTime.slice(0, 5),
      endTime: r.endTime.slice(0, 5),
      subject: r.subject,
      message: r.message,
      status: r.status as any,
      facultyNote: r.facultyNote,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      facultyName: '',
      facultyEmail: '',
      studentName: `${r.studentFirstName} ${r.studentLastName}`.trim(),
      studentNumber: r.studentNumber,
      studentProgram: r.studentProgram,
    }));
  },

  async findRequestById(id: string) {
    const [row] = await db
      .select()
      .from(consultationRequests)
      .where(eq(consultationRequests.id, id))
      .limit(1);

    return row ?? null;
  },

  async updateRequestStatus(id: string, status: 'approved' | 'declined' | 'cancelled', facultyNote?: string) {
    const [updated] = await db
      .update(consultationRequests)
      .set({
        status,
        facultyNote: facultyNote ?? null,
        updatedAt: new Date(),
      })
      .where(eq(consultationRequests.id, id))
      .returning();

    return updated;
  },

  async setFacultySlots(facultyId: string, slots: Array<{ day: any; startTime: string; endTime: string }>) {
    // Transactionally replace faculty slots
    await db.delete(consultationSlots).where(eq(consultationSlots.facultyId, facultyId));

    if (slots.length > 0) {
      await db.insert(consultationSlots).values(
        slots.map((s) => ({
          facultyId,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: true,
        }))
      );
    }

    return this.findProfessorSlots(facultyId);
  },
};
