import type { StudentProfile } from '../types';

export const mockStudentProfile: StudentProfile = {
  id: 'stu_096_prachi',
  erpStudentId: 'SKIT/2023/CSE-IOT/096',
  name: 'Prachi Bhardwaj',
  email: 'prachi.bhardwaj@skit.ac.in',
  college: 'Swami Keshvanand Institute of Technology (SKIT)',
  branch: 'CSE (Internet of Things)',
  section: 'A-G2',
  semester: 6,
  cgpa: 8.42,
  academicYear: '2023-2027',
  interests: [
    'Web Development',
    'Frontend Engineering',
    'IoT Device Cloud Integration',
    'Applied Artificial Intelligence',
  ],
  skills: [
    { name: 'JavaScript / TypeScript', level: 'Advanced', source: 'SELF_REPORTED' },
    { name: 'React.js', level: 'Intermediate', source: 'SELF_REPORTED' },
    { name: 'Data Structures & Algorithms', level: 'Intermediate', source: 'ERP_COURSEWORK' },
    { name: 'Database Management Systems (DBMS)', level: 'Advanced', source: 'ERP_COURSEWORK' },
    { name: 'Computer Networks & IoT Protocols', level: 'Intermediate', source: 'ERP_COURSEWORK' },
    { name: 'Python Basics', level: 'Beginner', source: 'RESUME_PARSED' },
    { name: 'Git & Version Control', level: 'Intermediate', source: 'SELF_REPORTED' },
  ],
  resumeUploaded: true,
  resumeFileName: 'Prachi_Bhardwaj_Resume_2026.pdf',
  lastErpSync: '2026-09-15 11:30 AM',
};

export const emptyStudentProfile: Partial<StudentProfile> = {
  erpStudentId: 'SKIT/2023/CSE-IOT/096',
  name: 'Prachi Bhardwaj',
  branch: 'CSE (IoT)',
  semester: 6,
  cgpa: 8.42,
  interests: [],
  skills: [],
  resumeUploaded: false,
};
