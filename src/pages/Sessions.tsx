import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Session } from '../types';
import { Plus, CheckCircle2, Circle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

export default function Sessions() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState(1);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [objInput, setObjInput] = useState('');
  const [sharedNotes, setSharedNotes] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');

  const fetchSessions = async () => {
    const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session)));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAddObjective = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && objInput.trim()) {
      e.preventDefault();
      if (!objectives.includes(objInput.trim())) {
        setObjectives([...objectives, objInput.trim()]);
      }
      setObjInput('');
    }
  };

  const removeObjective = (obj: string) => {
    setObjectives(objectives.filter(o => o !== obj));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'sessions'), {
        title,
        phase,
        objectives,
        sharedNotes,
        privateNotes,
        completed: false,
        date: Timestamp.now()
      });
      setShowForm(false);
      setTitle('');
      setPhase(1);
      setObjectives([]);
      setSharedNotes('');
      setPrivateNotes('');
      fetchSessions();
    } catch (error) {
      console.error('Error adding session:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (session: Session) => {
    if (profile?.role !== 'teacher') return;
    const docRef = doc(db, 'sessions', session.id);
    await updateDoc(docRef, { completed: !session.completed });
    fetchSessions();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif text-ink">Sessions</h1>
          <p className="text-ink/60 mt-1">Daily lesson logs and objectives</p>
        </div>
        {profile?.role === 'teacher' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-ink text-parchment px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-ink/90 transition-colors"
          >
            <Plus size={20} /> New Session
          </button>
        )}
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Session Title</label>
                  <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                    placeholder="e.g. Introduction to linear equations"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Phase</label>
                  <div className="flex gap-4">
                    {[1, 2, 3].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPhase(p)}
                        className={clsx(
                          "flex-1 py-2 rounded-xl border transition-all",
                          phase === p ? "bg-gold text-white border-gold" : "bg-parchment text-ink/60 border-transparent"
                        )}
                      >
                        Phase {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Objectives (Press Enter to add)</label>
                <div className="flex flex-wrap gap-2 p-3 bg-parchment rounded-xl min-h-[50px]">
                  {objectives.map(obj => (
                    <span key={obj} className="bg-white px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-black/5">
                      {obj}
                      <button type="button" onClick={() => removeObjective(obj)}><X size={14} /></button>
                    </span>
                  ))}
                  <input
                    value={objInput}
                    onChange={e => setObjInput(e.target.value)}
                    onKeyDown={handleAddObjective}
                    className="bg-transparent border-none outline-none flex-1 min-w-[120px]"
                    placeholder="Add objective..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Shared Notes</label>
                <textarea
                  value={sharedNotes}
                  onChange={e => setSharedNotes(e.target.value)}
                  className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none min-h-[100px]"
                  placeholder="Notes visible to Abdullah..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Private Teacher Notes</label>
                <textarea
                  value={privateNotes}
                  onChange={e => setPrivateNotes(e.target.value)}
                  className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none min-h-[100px]"
                  placeholder="Private notes for yourself..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-ink/60 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold text-white px-8 py-2 rounded-xl font-medium hover:bg-gold/90 transition-colors"
                >
                  {loading ? 'Saving...' : 'Create Session'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-black/10">
            <p className="text-ink/40 italic font-serif mb-4">No sessions logged yet.</p>
            {profile?.role === 'teacher' && (
              <button onClick={() => setShowForm(true)} className="text-gold font-medium hover:underline">
                Start the first session
              </button>
            )}
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div 
                className="p-6 flex items-center gap-6 cursor-pointer hover:bg-parchment/30 transition-colors"
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleComplete(session); }}
                  className={clsx(
                    "transition-colors",
                    session.completed ? "text-sage" : "text-ink/20"
                  )}
                >
                  {session.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={clsx(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white",
                      session.phase === 1 ? "bg-sage" : session.phase === 2 ? "bg-gold" : "bg-ink"
                    )}>
                      Phase {session.phase}
                    </span>
                    <span className="text-xs text-ink/40">{session.date?.seconds ? format(new Date(session.date.seconds * 1000), 'MMM d, yyyy') : ''}</span>
                  </div>
                  <h3 className="text-xl font-serif text-ink">{session.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {session.objectives.map(obj => (
                      <span key={obj} className="text-[10px] bg-parchment px-2 py-0.5 rounded text-ink/60 border border-black/5">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
                {expandedId === session.id ? <ChevronUp className="text-ink/20" /> : <ChevronDown className="text-ink/20" />}
              </div>

              <AnimatePresence>
                {expandedId === session.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-black/5 bg-parchment/20"
                  >
                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider font-bold text-ink/40">Shared Notes</h4>
                        <p className="text-ink/80 whitespace-pre-wrap leading-relaxed">{session.sharedNotes || 'No notes shared.'}</p>
                      </div>
                      {profile?.role === 'teacher' && (
                        <div className="space-y-2 p-4 bg-gold/5 rounded-xl border border-gold/10">
                          <h4 className="text-xs uppercase tracking-wider font-bold text-gold/60">Private Teacher Notes</h4>
                          <p className="text-ink/80 whitespace-pre-wrap leading-relaxed italic">{session.privateNotes || 'No private notes.'}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
