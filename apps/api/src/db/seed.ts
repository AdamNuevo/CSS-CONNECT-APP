import argon2 from 'argon2';
import { db, pool } from './client.js';
import {
  users,
  courses,
  facultyCourseAssignments,
  classSchedules,
  enrollments,
  consultationSlots,
  organizations,
  orgMemberships,
  announcements,
  events,
  researchStudies,
  evaluationPeriods,
  ccsMasterlist,
  campusRooms,
  grades,
} from './schema/index.js';

async function seed() {
  console.log('Seeding database...');

  const passwordHash = await argon2.hash('TempPass1!');

  // Clear in reverse dependency order
  console.log('Clearing existing data...');
  await db.delete(grades);
  await db.delete(orgMemberships);
  await db.delete(announcements);
  await db.delete(events);
  await db.delete(researchStudies);
  await db.delete(consultationSlots);
  await db.delete(classSchedules);
  await db.delete(campusRooms);
  await db.delete(enrollments);
  await db.delete(facultyCourseAssignments);
  await db.delete(courses);
  await db.delete(organizations);
  await db.delete(evaluationPeriods);
  await db.delete(users);
  await db.delete(ccsMasterlist);

  // CCS Masterlist (pre-enrolled students awaiting first-time activation)
  console.log('Populating CCS masterlist...');
  await db.insert(ccsMasterlist).values([
    {
      email: 'daniela.bernal@students.qcu.edu.ph',
      role: 'student',
      firstName: 'Daniela',
      lastName: 'Bernal',
      middleName: 'Perez',
      studentNumber: '2024-00101',
      program: 'BSIT',
      yearLevel: '1st Year',
      section: 'IT-102',
      isClaimed: false,
    },
    {
      email: 'paolo.torres@students.qcu.edu.ph',
      role: 'student',
      firstName: 'Paolo',
      lastName: 'Torres',
      middleName: 'Gomez',
      studentNumber: '2024-00102',
      program: 'BSCS',
      yearLevel: '1st Year',
      section: 'CS-101',
      isClaimed: false,
    },
  ]);

  // Users
  console.log('Creating users...');

  const [admin] = await db
    .insert(users)
    .values({
      email: 'admin@ccs.qcu.edu.ph',
      passwordHash,
      role: 'admin',
      firstName: 'Maria',
      lastName: 'Santos',
      mustChangePassword: false,
    })
    .returning();

  const [faculty1, faculty2, faculty3] = await db
    .insert(users)
    .values([
      {
        email: 'jose.reyes@ccs.qcu.edu.ph',
        passwordHash,
        role: 'faculty',
        firstName: 'Jose',
        lastName: 'Reyes',
        middleName: 'Bautista',
        employeeNumber: 'EMP-2018-001',
        mustChangePassword: false,
      },
      {
        email: 'ana.delacruz@ccs.qcu.edu.ph',
        passwordHash,
        role: 'faculty',
        firstName: 'Ana',
        lastName: 'Dela Cruz',
        middleName: 'Manalang',
        employeeNumber: 'EMP-2019-002',
        mustChangePassword: false,
      },
      {
        email: 'ramon.garcia@ccs.qcu.edu.ph',
        passwordHash,
        role: 'faculty',
        firstName: 'Ramon',
        lastName: 'Garcia',
        middleName: 'Tolentino',
        employeeNumber: 'EMP-2020-003',
        mustChangePassword: false,
      },
    ])
    .returning();

  const studentData = [
    { firstName: 'Kristine', lastName: 'Villanueva', num: '2022-00001', program: 'BSIT', year: '3rd Year', section: 'IT-301' },
    { firstName: 'Mark',     lastName: 'Ramos',      num: '2022-00002', program: 'BSIT', year: '3rd Year', section: 'IT-301' },
    { firstName: 'Jessa',    lastName: 'Aquino',     num: '2022-00003', program: 'BSCS', year: '3rd Year', section: 'CS-301' },
    { firstName: 'Carlo',    lastName: 'Mendoza',    num: '2023-00001', program: 'BSIT', year: '2nd Year', section: 'IT-201' },
    { firstName: 'Patricia', lastName: 'Flores',     num: '2023-00002', program: 'BSCS', year: '2nd Year', section: 'CS-201' },
    { firstName: 'Angelo',   lastName: 'Cruz',       num: '2024-00001', program: 'BSIT', year: '1st Year', section: 'IT-101' },
    { firstName: 'Sophia',   lastName: 'Lim',        num: '2021-00001', program: 'BSCS', year: '4th Year', section: 'CS-401' },
    { firstName: 'Ryan',     lastName: 'Pascual',    num: '2021-00002', program: 'BSIT', year: '4th Year', section: 'IT-401' },
  ];

  const insertedStudents = await db
    .insert(users)
    .values(
      studentData.map((s) => ({
        email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@students.qcu.edu.ph`,
        passwordHash,
        role: 'student' as const,
        firstName: s.firstName,
        lastName: s.lastName,
        studentNumber: s.num,
        program: s.program,
        yearLevel: s.year,
        section: s.section,
        mustChangePassword: false,
      }))
    )
    .returning();

  console.log(`   - Created 1 admin, 3 faculty, ${insertedStudents.length} students`);

  // Courses
  console.log('Creating courses...');
  const insertedCourses = await db
    .insert(courses)
    .values([
      {
        code: 'IT101',
        title: 'Introduction to Computing',
        units: 3,
        program: 'BSIT',
        yearLevel: '1st Year',
        description: 'Fundamentals of computing and information technology, including hardware, software, networks, and digital literacy.',
      },
      {
        code: 'IT201',
        title: 'Data Structures and Algorithms',
        units: 3,
        program: 'BSIT',
        yearLevel: '2nd Year',
        description: 'Linear and non-linear data structures, algorithm design and analysis, time and space complexity.',
      },
      {
        code: 'IT301',
        title: 'Application Development and Emerging Technologies',
        units: 3,
        program: 'BSIT',
        yearLevel: '3rd Year',
        description: 'Mobile and web application development with modern frameworks; survey of emerging technologies.',
      },
      {
        code: 'CS201',
        title: 'Discrete Mathematics',
        units: 3,
        program: 'BSCS',
        yearLevel: '2nd Year',
        description: 'Logic, proof techniques, sets, relations, graph theory, and combinatorics for computer science.',
      },
      {
        code: 'CS301',
        title: 'Theory of Computation',
        units: 3,
        program: 'BSCS',
        yearLevel: '3rd Year',
        description: 'Automata theory, formal languages, Turing machines, decidability, and computational complexity.',
      },
      {
        code: 'GE001',
        title: 'Understanding the Self',
        units: 3,
        program: 'BSIT',
        yearLevel: '1st Year',
        description: 'General education course exploring personal identity, human nature, and self-development.',
      },
    ])
    .returning();

  // ── Faculty Course Assignments ─────────────────────────────────────────────
  await db.insert(facultyCourseAssignments).values([
    { facultyId: faculty1.id, courseId: insertedCourses[0].id, academicYear: '2026-2027', semester: 1, section: 'IT-101' },
    { facultyId: faculty1.id, courseId: insertedCourses[1].id, academicYear: '2026-2027', semester: 1, section: 'IT-201' },
    { facultyId: faculty2.id, courseId: insertedCourses[2].id, academicYear: '2026-2027', semester: 1, section: 'IT-301' },
    { facultyId: faculty3.id, courseId: insertedCourses[3].id, academicYear: '2026-2027', semester: 1, section: 'CS-201' },
    { facultyId: faculty3.id, courseId: insertedCourses[4].id, academicYear: '2026-2027', semester: 1, section: 'CS-301' },
  ]);
  console.log(`   - Created ${insertedCourses.length} courses with faculty assignments`);

  // Campus Rooms
  console.log('Creating campus rooms...');
  await db.insert(campusRooms).values([
    { code: 'CCS-101', name: 'Lecture Room 101', building: 'main', floor: 1, capacity: 45, description: 'Ground floor lecture room with multimedia projector.' },
    { code: 'CCS-102', name: 'Lecture Room 102', building: 'main', floor: 1, capacity: 45, description: 'Ground floor lecture room next to faculty lounge.' },
    { code: 'CCS-201', name: 'Lecture Room 201', building: 'main', floor: 2, capacity: 40, description: 'Second floor CS lecture room with whiteboards.' },
    { code: 'CCS-202', name: 'Lecture Room 202', building: 'main', floor: 2, capacity: 40, description: 'Second floor CS lecture room with dual displays.' },
    { code: 'CCS-Lab1', name: 'Computer Laboratory 1', building: 'annex', floor: 2, capacity: 35, description: 'Advanced programming laboratory with 35 workstations.' },
  ]);

  // Class Schedules
  console.log('Creating class schedules...');
  await db.insert(classSchedules).values([
    { courseId: insertedCourses[0].id, facultyId: faculty1.id, section: 'IT-101', day: 'monday',    startTime: '07:30', endTime: '09:00', room: 'CCS-101',  academicYear: '2026-2027', semester: 1 },
    { courseId: insertedCourses[0].id, facultyId: faculty1.id, section: 'IT-101', day: 'wednesday', startTime: '07:30', endTime: '09:00', room: 'CCS-101',  academicYear: '2026-2027', semester: 1 },
    { courseId: insertedCourses[1].id, facultyId: faculty1.id, section: 'IT-201', day: 'tuesday',   startTime: '10:30', endTime: '12:00', room: 'CCS-102',  academicYear: '2026-2027', semester: 1 },
    { courseId: insertedCourses[1].id, facultyId: faculty1.id, section: 'IT-201', day: 'thursday',  startTime: '10:30', endTime: '12:00', room: 'CCS-102',  academicYear: '2026-2027', semester: 1 },
    { courseId: insertedCourses[2].id, facultyId: faculty2.id, section: 'IT-301', day: 'monday',    startTime: '13:00', endTime: '14:30', room: 'CCS-Lab1', academicYear: '2026-2027', semester: 1 },
    { courseId: insertedCourses[2].id, facultyId: faculty2.id, section: 'IT-301', day: 'friday',    startTime: '13:00', endTime: '14:30', room: 'CCS-Lab1', academicYear: '2026-2027', semester: 1 },
    { courseId: insertedCourses[3].id, facultyId: faculty3.id, section: 'CS-201', day: 'tuesday',   startTime: '07:30', endTime: '09:00', room: 'CCS-201',  academicYear: '2026-2027', semester: 1 },
    { courseId: insertedCourses[4].id, facultyId: faculty3.id, section: 'CS-301', day: 'wednesday', startTime: '10:30', endTime: '12:00', room: 'CCS-202',  academicYear: '2026-2027', semester: 1 },
  ]);

  // ── Enrollments ───────────────────────────────────────────────────────────
  await db.insert(enrollments).values([
    // Angelo Cruz (1st year BSIT) → IT101, GE001
    { studentId: insertedStudents[5].id, courseId: insertedCourses[0].id, academicYear: '2026-2027', semester: 1 },
    { studentId: insertedStudents[5].id, courseId: insertedCourses[5].id, academicYear: '2026-2027', semester: 1 },
    // Carlo Mendoza (2nd year BSIT) → IT201
    { studentId: insertedStudents[3].id, courseId: insertedCourses[1].id, academicYear: '2026-2027', semester: 1 },
    // Patricia Flores (2nd year BSCS) → CS201
    { studentId: insertedStudents[4].id, courseId: insertedCourses[3].id, academicYear: '2026-2027', semester: 1 },
    // Kristine Villanueva (3rd year BSIT) → IT301
    { studentId: insertedStudents[0].id, courseId: insertedCourses[2].id, academicYear: '2026-2027', semester: 1 },
    // Mark Ramos (3rd year BSIT) → IT301
    { studentId: insertedStudents[1].id, courseId: insertedCourses[2].id, academicYear: '2026-2027', semester: 1 },
    // Jessa Aquino (3rd year BSCS) → CS301
    { studentId: insertedStudents[2].id, courseId: insertedCourses[4].id, academicYear: '2026-2027', semester: 1 },
  ]);

  // Grades
  console.log('Creating student grades...');
  await db.insert(grades).values([
    // Angelo Cruz (IT101 and GE001)
    { studentId: insertedStudents[5].id, courseId: insertedCourses[0].id, academicYear: '2026-2027', semester: 1, period: 'Midterms', grade: '1.25' },
    { studentId: insertedStudents[5].id, courseId: insertedCourses[0].id, academicYear: '2026-2027', semester: 1, period: 'Finals', grade: '1.50' },
    { studentId: insertedStudents[5].id, courseId: insertedCourses[5].id, academicYear: '2026-2027', semester: 1, period: 'Midterms', grade: '1.75' },
    { studentId: insertedStudents[5].id, courseId: insertedCourses[5].id, academicYear: '2026-2027', semester: 1, period: 'Finals', grade: '1.75' },
    // Kristine Villanueva (IT301)
    { studentId: insertedStudents[0].id, courseId: insertedCourses[2].id, academicYear: '2026-2027', semester: 1, period: 'Midterms', grade: '1.25' },
    { studentId: insertedStudents[0].id, courseId: insertedCourses[2].id, academicYear: '2026-2027', semester: 1, period: 'Finals', grade: '1.25' },
  ]);

  // Consultation Slots
  console.log('Creating consultation slots...');
  await db.insert(consultationSlots).values([
    // Prof. Jose Reyes — Mon/Wed morning, Fri afternoon
    { facultyId: faculty1.id, day: 'monday',    startTime: '09:00', endTime: '09:30' },
    { facultyId: faculty1.id, day: 'monday',    startTime: '09:30', endTime: '10:00' },
    { facultyId: faculty1.id, day: 'wednesday', startTime: '09:00', endTime: '09:30' },
    { facultyId: faculty1.id, day: 'friday',    startTime: '14:00', endTime: '14:30' },
    // Prof. Ana Dela Cruz — Tue/Thu morning
    { facultyId: faculty2.id, day: 'tuesday',   startTime: '08:00', endTime: '08:30' },
    { facultyId: faculty2.id, day: 'thursday',  startTime: '08:00', endTime: '08:30' },
    { facultyId: faculty2.id, day: 'thursday',  startTime: '08:30', endTime: '09:00' },
    // Prof. Ramon Garcia — Mon afternoon, Fri morning
    { facultyId: faculty3.id, day: 'monday',    startTime: '15:00', endTime: '15:30' },
    { facultyId: faculty3.id, day: 'friday',    startTime: '09:00', endTime: '09:30' },
  ]);

  // Organizations
  console.log('Creating organizations...');
  const insertedOrgs = await db
    .insert(organizations)
    .values([
      {
        name: 'ACM Student Chapter QCU',
        acronym: 'ACM-QCU',
        description:
          'The Association for Computing Machinery student chapter at Quezon City University, promoting computer science excellence and professional development through competitions, workshops, and industry networking.',
        adviserId: faculty3.id,
      },
      {
        name: 'Google Developer Student Club QCU',
        acronym: 'GDSC-QCU',
        description:
          'A student-led program backed by Google, helping students grow their knowledge on Google developer technologies through peer-to-peer workshops, hackathons, and solution challenges.',
        adviserId: faculty2.id,
      },
      {
        name: 'CS Guild',
        acronym: 'CS-GUILD',
        description:
          'The official student organization for BS Computer Science students at QCU-CCS, fostering academic excellence, industry connections, and community among CS students.',
        adviserId: faculty1.id,
      },
    ])
    .returning();

  // ── Org Memberships ───────────────────────────────────────────────────────
  await db.insert(orgMemberships).values([
    // ACM-QCU
    { organizationId: insertedOrgs[0].id, userId: insertedStudents[2].id, status: 'active',  role: 'officer'   }, // Jessa Aquino
    { organizationId: insertedOrgs[0].id, userId: insertedStudents[6].id, status: 'active',  role: 'president' }, // Sophia Lim
    // GDSC-QCU
    { organizationId: insertedOrgs[1].id, userId: insertedStudents[0].id, status: 'active',  role: 'member' }, // Kristine Villanueva
    { organizationId: insertedOrgs[1].id, userId: insertedStudents[1].id, status: 'pending', role: 'member' }, // Mark Ramos
    // CS Guild
    { organizationId: insertedOrgs[2].id, userId: insertedStudents[2].id, status: 'active',  role: 'member' }, // Jessa Aquino
    { organizationId: insertedOrgs[2].id, userId: insertedStudents[4].id, status: 'active',  role: 'member' }, // Patricia Flores
  ]);
  console.log(`   - Created ${insertedOrgs.length} organizations with memberships`);

  // Announcements
  console.log('Creating announcements...');
  await db.insert(announcements).values([
    {
      title: 'Enrollment for Second Semester AY 2026-2027 Now Open',
      body: "Students may now enroll for the second semester. Please ensure your account balance is settled before proceeding. Contact the registrar for any enrollment concerns. Deadline for late enrollment is January 15, 2027. Bring your registration form, clearance slip, and two valid IDs to the Registrar's Office.",
      audience: 'ccs',
      isPinned: true,
      publishedAt: new Date('2026-11-01T08:00:00+08:00'),
      createdBy: admin.id,
    },
    {
      title: 'CCS Tech Week 2026 — Registration Now Open',
      body: 'Join us for a week-long celebration of technology and innovation from December 1–5, 2026. Activities include a 24-hour hackathon, competitive coding contest, tech talks from industry professionals, and an exhibit of capstone projects. Register through the CCS Hub app. Teams must be composed of 3 to 5 CCS students.',
      audience: 'ccs',
      isPinned: true,
      publishedAt: new Date('2026-11-15T08:00:00+08:00'),
      createdBy: admin.id,
    },
    {
      title: 'Faculty Evaluation Period — First Semester AY 2026-2027',
      body: 'The faculty evaluation for First Semester AY 2026-2027 is now open. All enrolled students are required to complete their evaluations on or before November 30, 2026. Access the evaluation form through the CCS Hub mobile app under the "Evaluations" tab. Your responses are anonymous and will be used to improve the quality of instruction.',
      audience: 'all',
      isPinned: false,
      publishedAt: new Date('2026-11-20T08:00:00+08:00'),
      createdBy: admin.id,
    },
    {
      title: 'Reminder: Submission of Capstone Proposal for AY 2026-2027',
      body: 'Fourth-year students who have not yet submitted their capstone project proposals are reminded to do so by December 10, 2026. Proposals must be submitted in PDF format via the CCS Hub portal under "Research & Capstone." Late submissions will not be entertained. For inquiries, contact your capstone adviser directly.',
      audience: 'ccs',
      isPinned: false,
      publishedAt: new Date('2026-11-18T08:00:00+08:00'),
      createdBy: admin.id,
    },
  ]);

  // Events
  console.log('Creating events...');
  await db.insert(events).values([
    {
      title: 'CCS Tech Week 2026 — Hackathon',
      description:
        'A 24-hour hackathon challenging CCS students to build innovative solutions to real-world problems. Teams of 3–5 members will compete for prizes and industry recognition. Theme: "Technology for Sustainable Communities." Meals and snacks will be provided. Judging criteria: innovation (30%), functionality (30%), presentation (20%), and code quality (20%).',
      category: 'academic',
      location: 'CCS Computer Laboratory 1 and 2, QCU Main Campus',
      startsAt: new Date('2026-12-01T08:00:00+08:00'),
      endsAt: new Date('2026-12-02T08:00:00+08:00'),
      registrationDeadline: new Date('2026-11-28T23:59:59+08:00'),
      maxSlots: 60,
      isPublished: true,
      createdBy: admin.id,
    },
    {
      title: 'Industry Talk: AI in Philippine Software Development',
      description:
        'A guest speaker from a leading Philippine IT company will discuss the current state and future of artificial intelligence in local software development. Topics include practical AI tools for developers, career pathways in AI, and what skills to build as a CS/IT student entering the Philippine tech industry.',
      category: 'seminar',
      location: 'QCU Main Auditorium',
      startsAt: new Date('2026-12-03T13:00:00+08:00'),
      endsAt: new Date('2026-12-03T16:00:00+08:00'),
      registrationDeadline: new Date('2026-12-02T23:59:59+08:00'),
      maxSlots: 200,
      isPublished: true,
      createdBy: admin.id,
    },
    {
      title: 'CCS Tech Week 2026 — Competitive Programming Contest',
      description:
        'An individual competitive programming contest open to all CCS students. Problems will range from beginner to advanced difficulty using the ACM ICPC format. Participants must bring their own laptops. Allowed languages: C++, Java, Python. Top 3 finishers will receive certificates and cash prizes.',
      category: 'academic',
      location: 'CCS Computer Laboratory 3, QCU Main Campus',
      startsAt: new Date('2026-12-04T09:00:00+08:00'),
      endsAt: new Date('2026-12-04T12:00:00+08:00'),
      registrationDeadline: new Date('2026-12-03T18:00:00+08:00'),
      maxSlots: 40,
      isPublished: true,
      createdBy: admin.id,
    },
  ]);

  // ── Evaluation Periods ────────────────────────────────────────────────────
  await db.insert(evaluationPeriods).values([
    {
      academicYear: '2026-2027',
      semester: 1,
      label: 'First Semester Faculty Evaluation',
      opensAt: new Date('2026-11-20T00:00:00+08:00'),
      closesAt: new Date('2026-11-30T23:59:59+08:00'),
    },
  ]);

  // Research Studies
  console.log('Creating research studies...');
  await db.insert(researchStudies).values([
    {
      title: 'Development of a Smart Attendance Monitoring System Using Facial Recognition for Quezon City University',
      authors: 'Reyes, M.A., Santos, J.P., Cruz, R.L.',
      abstract:
        'This study presents the design and implementation of an automated attendance monitoring system using facial recognition technology. The system leverages OpenCV and deep learning models to identify students in real time, reducing manual attendance recording time by 87%. Testing was conducted across three College of Computer Studies classrooms over one semester with an overall identification accuracy of 96.4%.',
      keywords: 'facial recognition, attendance monitoring, deep learning, OpenCV, automation, biometrics',
      program: 'BSIT',
      academicYear: '2024-2025',
      uploadedBy: admin.id,
    },
    {
      title: 'A Web-Based Inventory Management System for Small-Scale Food Enterprises in Quezon City',
      authors: 'Dela Cruz, A.B., Villanueva, K.M., Aquino, R.S.',
      abstract:
        'Small-scale food enterprises in Quezon City face persistent challenges in inventory management due to limited resources and lack of technical expertise. This study developed a web-based system integrating barcode scanning, automated low-stock alerts, supplier management, and financial reporting dashboards. The system was deployed in five pilot establishments over three months and reduced inventory discrepancies by 64% while decreasing average stockout incidents by 41%.',
      keywords: 'inventory management, web application, food enterprise, barcode scanning, small business, Philippine SME',
      program: 'BSIT',
      academicYear: '2025-2026',
      uploadedBy: admin.id,
    },
    {
      title: 'Comparative Analysis of Machine Learning Algorithms for Predicting Student Academic Performance in Philippine Higher Education Institutions',
      authors: 'Garcia, R.T., Lim, S.A., Pascual, R.M.',
      abstract:
        'This paper compares the predictive performance of decision trees, random forests, support vector machines, and multilayer perceptron neural networks for forecasting student GPA based on demographic, socioeconomic, and prior academic features. A dataset of 500 anonymized student records from two consecutive academic years was used. Random Forest achieved the highest accuracy at 91.3% and F1-score of 0.89. The study proposes an early-warning dashboard to flag at-risk students before the midterm examination period.',
      keywords: 'machine learning, academic performance prediction, random forest, early warning system, Philippine higher education, student analytics',
      program: 'BSCS',
      academicYear: '2025-2026',
      uploadedBy: admin.id,
    },
    {
      title: 'Design and Implementation of a Campus Navigation Mobile Application Using Indoor Positioning for Quezon City University',
      authors: 'Mendoza, C.R., Flores, P.A., Santos, A.B.',
      abstract:
        'Students and visitors frequently have difficulty locating rooms, offices, and facilities within the QCU main campus. This study designed and implemented a mobile application providing indoor navigation using a combination of Wi-Fi fingerprinting and BLE beacon positioning. The app renders a 2D floor plan overlay with turn-by-turn directions and achieves a mean positioning error of 1.8 meters. User acceptance testing with 80 student respondents yielded a System Usability Scale score of 83.5, classified as "Excellent."',
      keywords: 'indoor navigation, mobile application, Wi-Fi fingerprinting, BLE beacons, campus navigation, usability',
      program: 'BSIT',
      academicYear: '2025-2026',
      uploadedBy: admin.id,
    },
  ]);
  console.log('   - Created 4 research studies');

  console.log('\nDatabase seeding complete.');
  console.log('\nSeed summary:');
  console.log('   Users    : 1 admin, 3 faculty, 8 students');
  console.log('   Courses  : 6 (IT101, IT201, IT301, CS201, CS301, GE001)');
  console.log('   Schedules: 8 class schedule entries');
  console.log('   Consults : 9 consultation slots across 3 faculty');
  console.log('   Orgs     : 3 (ACM-QCU, GDSC-QCU, CS Guild)');
  console.log('   Events   : 3');
  console.log('   Research : 4 studies');
  console.log('\nAll users share password: TempPass1!');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    process.exit(0);
  });
