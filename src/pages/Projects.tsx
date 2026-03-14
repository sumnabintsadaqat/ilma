import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Project, ProjectPillar, ProjectStatus } from '../types';
import { FolderKanban, ChevronRight, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { PRE_SEEDED_PROJECTS } from '../constants';

export default function Projects() {
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for submission
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  // Form state for review
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState(0);

  const fetchProjects = async () => {
    const q = query(collection(db, 'projects'), orderBy('phase', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty && profile?.role === 'student') {
      // Seed if empty for this student
      for (const p of PRE_SEEDED_PROJECTS) {
        await addDoc(collection(db, 'projects'), { 
          ...p, 
          studentUid: user?.uid, 
          dueDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) 
        });
      }
      fetchProjects();
    } else {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [profile]);

  const handleOpenProject = (p: Project) => {
    setSelectedProject(p);
    setSubmissionText(p.submissionText || '');
    setSubmissionUrl(p.submissionUrl || '');
    setFeedback(p.feedback || '');
    setGrade(p.grade || 0);
  };

  const handleSubmitWork = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'projects', selectedProject.id);
      await updateDoc(docRef, {
        submissionText,
        submissionUrl,
        status: 'submitted'
      });
      setSelectedProject({ ...selectedProject, submissionText, submissionUrl, status: 'submitted' });
      fetchProjects();
    } catch (error) {
      console.error('Error submitting work:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewWork = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'projects', selectedProject.id);
      await updateDoc(docRef, {
        feedback,
        grade,
        status: 'reviewed'
      });
      setSelectedProject({ ...selectedProject, feedback, grade, status: 'reviewed' });
      fetchProjects();
    } catch (error) {
      console.error('Error reviewing work:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPillarColor = (p: ProjectPillar) => {
    switch (p) {
      case 'reading': return 'bg-sage text-white';
      case 'writing': return 'bg-gold text-white';
      case 'maths': return 'bg-blue-500 text-white';
      case 'business': return 'bg-ink text-white';
      case 'combined': return 'bg-pink-500 text-white';
    }
  };

  const getStatusColor = (s: ProjectStatus) => {
    switch (s) {
      case 'not started': return 'bg-ink/5 text-ink/40';
      case 'in progress': return 'bg-gold/10 text-gold';
      case 'submitted': return 'bg-sage/10 text-sage';
      case 'reviewed': return 'bg-green-500/10 text-green-600';
    }
  };

  const phases = [1, 2, 3];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-serif text-ink">Projects</h1>
        <p className="text-ink/60 mt-1">The 6-month guided learning journey</p>
      </header>

      {phases.map(phase => (
        <section key={phase} className="space-y-6">
          <div className="flex items-center gap-4">
            <span className={clsx(
              "px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest",
              phase === 1 ? "bg-sage" : phase === 2 ? "bg-gold" : "bg-ink"
            )}>
              Phase {phase} — {phase === 1 ? 'Foundation' : phase === 2 ? 'Building' : 'Launching'}
            </span>
            <div className="flex-1 h-px bg-black/5"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.filter(p => p.phase === phase).map(project => (
              <motion.div
                key={project.id}
                whileHover={{ y: -4 }}
                onClick={() => handleOpenProject(project)}
                className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded", getPillarColor(project.pillar))}>
                    {project.pillar}
                  </span>
                  <span className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded", getStatusColor(project.status))}>
                    {project.status}
                  </span>
                </div>
                <h3 className="text-xl font-serif text-ink mb-2 group-hover:text-gold transition-colors">{project.title}</h3>
                <p className="text-sm text-ink/60 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                  <span className="text-xs text-ink/40">Due {project.dueDate?.seconds ? format(new Date(project.dueDate.seconds * 1000), 'MMM d') : ''}</span>
                  {project.status === 'reviewed' && (
                    <span className="text-lg font-serif text-sage">{project.grade}/100</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-parchment w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded", getPillarColor(selectedProject.pillar))}>
                      {selectedProject.pillar}
                    </span>
                    <span className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded", getStatusColor(selectedProject.status))}>
                      {selectedProject.status}
                    </span>
                  </div>
                  <h2 className="text-3xl font-serif text-ink">{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-ink/40 hover:text-ink"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                <section>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-ink/40 mb-3">Project Brief</h4>
                  <p className="text-ink/80 leading-relaxed bg-white/50 p-6 rounded-2xl border border-black/5 italic font-serif">
                    {selectedProject.description}
                  </p>
                </section>

                {/* Submission Section */}
                <section className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-ink/40">Student Submission</h4>
                  {profile?.role === 'student' && selectedProject.status !== 'reviewed' ? (
                    <div className="space-y-4">
                      <textarea
                        value={submissionText}
                        onChange={e => setSubmissionText(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl p-6 focus:ring-2 focus:ring-gold outline-none min-h-[200px]"
                        placeholder="Write your submission here..."
                      />
                      <input
                        value={submissionUrl}
                        onChange={e => setSubmissionUrl(e.target.value)}
                        className="w-full bg-white border-none rounded-xl p-4 focus:ring-2 focus:ring-gold outline-none"
                        placeholder="Optional URL link (e.g. Google Drive, Video)"
                      />
                      <button
                        onClick={handleSubmitWork}
                        disabled={loading}
                        className="bg-sage text-white px-8 py-3 rounded-xl font-medium hover:bg-sage/90 transition-colors w-full"
                      >
                        {loading ? 'Submitting...' : 'Submit Work'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-black/5 space-y-4">
                      <p className="text-ink/80 whitespace-pre-wrap leading-relaxed">{selectedProject.submissionText || 'No submission yet.'}</p>
                      {selectedProject.submissionUrl && (
                        <a 
                          href={selectedProject.submissionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gold hover:underline text-sm font-medium"
                        >
                          <ExternalLink size={16} /> View external resource
                        </a>
                      )}
                    </div>
                  )}
                </section>

                {/* Review Section */}
                {(selectedProject.status === 'submitted' || selectedProject.status === 'reviewed') && (
                  <section className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-ink/40">Teacher Feedback & Grade</h4>
                    {profile?.role === 'teacher' && selectedProject.status === 'submitted' ? (
                      <div className="space-y-4 bg-gold/5 p-8 rounded-3xl border border-gold/10">
                        <textarea
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                          className="w-full bg-white border-none rounded-2xl p-6 focus:ring-2 focus:ring-gold outline-none min-h-[150px]"
                          placeholder="Provide feedback to Abdullah..."
                        />
                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium text-ink">Grade (out of 100):</label>
                          <input
                            type="number"
                            value={grade}
                            onChange={e => setGrade(parseInt(e.target.value))}
                            className="w-24 bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                            max="100"
                            min="0"
                          />
                        </div>
                        <button
                          onClick={handleReviewWork}
                          disabled={loading}
                          className="bg-gold text-white px-8 py-3 rounded-xl font-medium hover:bg-gold/90 transition-colors w-full"
                        >
                          {loading ? 'Saving Review...' : 'Review Submission'}
                        </button>
                      </div>
                    ) : selectedProject.status === 'reviewed' ? (
                      <div className="bg-gold/5 p-8 rounded-3xl border border-gold/10 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gold uppercase tracking-widest">Feedback</span>
                          <span className="text-3xl font-serif text-gold">{selectedProject.grade}/100</span>
                        </div>
                        <p className="text-ink/80 italic leading-relaxed">{selectedProject.feedback}</p>
                      </div>
                    ) : null}
                  </section>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
