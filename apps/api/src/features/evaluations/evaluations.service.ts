import { evaluationsRepository } from './evaluations.repository.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors/app-error.js';
import type { StudentEvaluationStatus, SubmitEvaluationInput } from '@ccs-hub/shared';

export const evaluationsService = {
  async getStudentEvaluationStatus(studentId: string): Promise<StudentEvaluationStatus> {
    const activePeriod = await evaluationsRepository.findActivePeriod();
    if (!activePeriod) {
      return {
        isActive: false,
        period: null,
        items: [],
        completedCount: 0,
        totalCount: 0,
      };
    }

    const [coursesWithFaculty, submissions] = await Promise.all([
      evaluationsRepository.findStudentCoursesWithFaculty(
        studentId,
        activePeriod.academicYear,
        activePeriod.semester
      ),
      evaluationsRepository.findSubmissionsByStudent(studentId, activePeriod.id),
    ]);

    const submissionMap = new Map<string, Date>();
    for (const sub of submissions) {
      submissionMap.set(`${sub.courseId}:${sub.facultyId}`, sub.submittedAt);
    }

    const items = coursesWithFaculty.map((item) => {
      const key = `${item.courseId}:${item.facultyId}`;
      const submittedAt = submissionMap.get(key);
      return {
        facultyId: item.facultyId,
        facultyName: `Prof. ${item.facultyFirstName} ${item.facultyLastName}`.trim(),
        courseId: item.courseId,
        courseCode: item.courseCode,
        courseTitle: item.courseTitle,
        section: item.section,
        isSubmitted: !!submittedAt,
        submittedAt: submittedAt ? submittedAt.toISOString() : null,
      };
    });

    const completedCount = items.filter((i) => i.isSubmitted).length;

    return {
      isActive: true,
      period: {
        id: activePeriod.id,
        academicYear: activePeriod.academicYear,
        semester: activePeriod.semester,
        label: activePeriod.label,
        opensAt: activePeriod.opensAt.toISOString(),
        closesAt: activePeriod.closesAt.toISOString(),
      },
      items,
      completedCount,
      totalCount: items.length,
    };
  },

  async submitEvaluation(studentId: string, input: SubmitEvaluationInput) {
    const activePeriod = await evaluationsRepository.findActivePeriod();
    if (!activePeriod || activePeriod.id !== input.periodId) {
      throw new BadRequestError('The faculty evaluation period is not currently active');
    }

    const existing = await evaluationsRepository.findSubmission(
      input.periodId,
      studentId,
      input.facultyId,
      input.courseId
    );

    if (existing) {
      throw new ConflictError('You have already submitted an evaluation for this instructor and course');
    }

    const submission = await evaluationsRepository.createSubmission({
      periodId: input.periodId,
      studentId,
      facultyId: input.facultyId,
      courseId: input.courseId,
      ratings: JSON.stringify(input.ratings),
      comments: input.comments,
    });

    return submission;
  },
};
