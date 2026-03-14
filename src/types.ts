export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Session {
  id: string;
  date: any; // Firestore Timestamp
  title: string;
  phase: number;
  objectives: string[];
  sharedNotes: string;
  privateNotes: string;
  completed: boolean;
}

export interface HifzSession {
  id: string;
  date: any;
  juz: number;
  fromSurah: string;
  fromAyah: number;
  toSurah: string;
  toAyah: number;
  quality: number;
  notes: string;
}

export type ProjectPillar = 'reading' | 'writing' | 'maths' | 'business' | 'combined';
export type ProjectStatus = 'not started' | 'in progress' | 'submitted' | 'reviewed';

export interface Project {
  id: string;
  phase: number;
  pillar: ProjectPillar;
  status: ProjectStatus;
  title: string;
  description: string;
  dueDate: any;
  submissionText?: string;
  submissionUrl?: string;
  feedback?: string;
  grade?: number;
  studentUid: string;
}

export interface ReadingLog {
  id: string;
  date: any;
  title: string;
  author: string;
  pagesRead: number;
  totalPages: number;
  notes: string;
  reflection: string;
}

export type WritingType = 'journal' | 'essay' | 'summary' | 'reflection';

export interface WritingEntry {
  id: string;
  date: any;
  type: WritingType;
  title: string;
  content: string;
  wordCount: number;
  feedback?: string;
}
