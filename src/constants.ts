import { Project } from './types';

export const SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Ta-Ha",
  "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
  "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
  "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

export const PRE_SEEDED_PROJECTS: Partial<Project>[] = [
  {
    phase: 1,
    pillar: 'reading',
    title: 'Read The Alchemist',
    description: 'Read the full book and write a 1-page reflection on what Santiago fears and what the student fears.',
    status: 'not started'
  },
  {
    phase: 1,
    pillar: 'writing',
    title: 'Daily Journal Week 1',
    description: 'Write 5 sentences every day for a week covering: what was learned, what was confusing, what to know next, one gratitude, one plan for tomorrow.',
    status: 'not started'
  },
  {
    phase: 1,
    pillar: 'maths',
    title: 'Logistics Maths Problem Set',
    description: "Solve real shipping calculation problems based on his father's logistics business.",
    status: 'not started'
  },
  {
    phase: 2,
    pillar: 'business',
    title: "Business Report on Father's Company",
    description: 'Research the Saudi logistics sector and write a 2-page analyst report on the company.',
    status: 'not started'
  },
  {
    phase: 2,
    pillar: 'combined',
    title: 'Physics in Logistics Essay',
    description: 'Write about the physical forces on container ships and aerodynamics of trucks.',
    status: 'not started'
  },
  {
    phase: 2,
    pillar: 'business',
    title: 'Islamic Business Ethics Report',
    description: "Research the Prophet's ﷺ life as a merchant and Khadijah's رضي الله عنها trading business, extract principles for Muslim businesspeople.",
    status: 'not started'
  },
  {
    phase: 3,
    pillar: 'business',
    title: 'Capstone Business Plan',
    description: 'Design a small business with a 1-page plan covering product/service, startup costs, projected income, physical constraints, and Islamic ethical framework.',
    status: 'not started'
  },
  {
    phase: 3,
    pillar: 'combined',
    title: 'Final Presentation',
    description: 'A 20-minute video presentation of the business plan, pitched as if to investors.',
    status: 'not started'
  }
];
