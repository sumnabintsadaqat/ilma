import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Session, HifzSession, Project, ReadingLog, WritingEntry } from '../types';
import { 
  History, 
  BookOpen, 
  FolderKanban, 
  BookMarked, 
  PenTool,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    sessions: 0,
    hifz: 0,
    projects: 0,
    books: 0,
    writing: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentHifz, setRecentHifz] = useState<HifzSession[]>([]);
  const [phaseProgress, setPhaseProgress] = useState([0, 0, 0]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Stats
      const sessionsSnap = await getDocs(query(collection(db, 'sessions'), where('completed', '==', true)));
      const hifzSnap = await getDocs(collection(db, 'hifz_sessions'));
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const booksSnap = await getDocs(collection(db, 'reading_logs'));
      const writingSnap = await getDocs(collection(db, 'writing_entries'));

      const reviewedProjects = projectsSnap.docs.filter(d => d.data().status === 'reviewed').length;

      setStats({
        sessions: sessionsSnap.size,
        hifz: hifzSnap.size,
        projects: reviewedProjects,
        books: booksSnap.size,
        writing: writingSnap.size
      });

      // Recent Projects
      const recentP = projectsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Project))
        .sort((a, b) => (b.dueDate?.seconds || 0) - (a.dueDate?.seconds || 0))
        .slice(0, 4);
      setRecentProjects(recentP);

      // Recent Hifz
      const recentH = hifzSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as HifzSession))
        .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
        .slice(0, 3);
      setRecentHifz(recentH);

      // Phase Progress
      const phases = [1, 2, 3].map(p => {
        const phaseProjects = projectsSnap.docs.filter(d => d.data().phase === p);
        const reviewed = phaseProjects.filter(d => d.data().status === 'reviewed').length;
        return phaseProjects.length > 0 ? (reviewed / phaseProjects.length) * 100 : 0;
      });
      setPhaseProgress(phases);
    };

    fetchDashboardData();
  }, []);

  const greeting = profile?.role === 'student' ? `Welcome back, ${profile.name}` : 'Peace be upon you';

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-serif text-ink mb-2">{greeting}</h1>
        <p className="text-ink/60 italic font-serif">
          "The ink of the scholar is more holy than the blood of the martyr."
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Sessions', value: stats.sessions, icon: History, color: 'text-sage' },
          { label: 'Hifz Revision', value: stats.hifz, icon: BookOpen, color: 'text-gold' },
          { label: 'Projects', value: stats.projects, icon: FolderKanban, color: 'text-blue-500' },
          { label: 'Books', value: stats.books, icon: BookMarked, color: 'text-sage' },
          { label: 'Writing', value: stats.writing, icon: PenTool, color: 'text-gold' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm"
          >
            <stat.icon className={`${stat.color} mb-4`} size={24} />
            <div className="text-3xl font-serif text-ink mb-1">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider font-bold text-ink/40">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <section className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-ink">Recent Projects</h2>
            <button className="text-gold text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects.map(project => (
              <div key={project.id} className="flex items-center justify-between p-4 rounded-xl bg-parchment/50 border border-black/5">
                <div>
                  <h3 className="font-serif text-lg text-ink">{project.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sage/10 text-sage">Phase {project.phase}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gold/10 text-gold">{project.pillar}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-ink/5 text-ink/60">{project.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Hifz */}
        <section className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-ink">Recent Hifz</h2>
            <button className="text-gold text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentHifz.map(session => (
              <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-parchment/50 border border-black/5">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-white font-serif text-xl shadow-sm">
                  {session.juz}
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-ink">{session.fromSurah} - {session.toSurah}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < session.quality ? 'fill-current' : 'opacity-20'}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-ink/40">{session.date?.seconds ? format(new Date(session.date.seconds * 1000), 'MMM d, yyyy') : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Progress Section */}
      <section className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
        <h2 className="text-2xl font-serif text-ink mb-8">Journey Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Foundation', phase: 1, color: 'bg-sage' },
            { label: 'Building', phase: 2, color: 'bg-gold' },
            { label: 'Launching', phase: 3, color: 'bg-ink' },
          ].map((phase, i) => (
            <div key={phase.label}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${phase.color} text-white mb-1 inline-block`}>
                    Phase {phase.phase}
                  </span>
                  <h3 className="font-serif text-xl text-ink">{phase.label}</h3>
                </div>
                <span className="text-2xl font-serif text-gold">{Math.round(phaseProgress[i])}%</span>
              </div>
              <div className="h-2 bg-parchment rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${phaseProgress[i]}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full ${phase.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
