import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { WritingEntry, WritingType } from '../types';
import { PenTool, Plus, X, MessageSquare, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

const JOURNAL_PROMPTS = [
  "What was learned today?",
  "What was confusing?",
  "What do I want to know next?",
  "One thing I am grateful for today...",
  "One plan for tomorrow..."
];

const REFLECTION_PROMPTS = [
  "How does this connect to my faith?",
  "What surprised me about this topic?",
  "How can I apply this knowledge?"
];

export default function Writing() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<WritingEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WritingEntry | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WritingType>('journal');
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState('');

  const fetchEntries = async () => {
    const q = query(collection(db, 'writing_entries'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as WritingEntry)));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'writing_entries'), {
        title,
        type,
        content,
        wordCount,
        date: Timestamp.now()
      });
      setShowForm(false);
      setTitle('');
      setType('journal');
      setContent('');
      fetchEntries();
    } catch (error) {
      console.error('Error adding writing entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedEntry) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'writing_entries', selectedEntry.id);
      await updateDoc(docRef, { feedback });
      setSelectedEntry({ ...selectedEntry, feedback });
      fetchEntries();
    } catch (error) {
      console.error('Error adding feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (t: WritingType) => {
    switch (t) {
      case 'journal': return 'bg-sage/10 text-sage';
      case 'essay': return 'bg-ink text-white';
      case 'summary': return 'bg-blue-500/10 text-blue-600';
      case 'reflection': return 'bg-gold/10 text-gold';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif text-ink">Writing</h1>
          <p className="text-ink/60 mt-1">Journal, essays, and reflections</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-ink text-parchment px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-ink/90 transition-colors"
        >
          <Plus size={20} /> New Entry
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-xl space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif text-ink">New Writing Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-ink/40 hover:text-ink"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Title</label>
                  <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-parchment border-none rounded-xl p-4 focus:ring-2 focus:ring-gold outline-none"
                    placeholder="Title of your writing..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Type</label>
                  <div className="flex gap-2">
                    {['journal', 'essay', 'summary', 'reflection'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t as WritingType)}
                        className={clsx(
                          "flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                          type === t ? "bg-gold text-white border-gold shadow-sm" : "bg-parchment text-ink/40 border-transparent"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(type === 'journal' || type === 'reflection') && (
                <div className="bg-gold/5 p-6 rounded-2xl border border-gold/10">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-gold mb-3">Structured Prompts</h4>
                  <ul className="space-y-2">
                    {(type === 'journal' ? JOURNAL_PROMPTS : REFLECTION_PROMPTS).map(prompt => (
                      <li key={prompt} className="text-sm text-ink/60 italic">• {prompt}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Content</label>
                  <span className="text-xs font-bold text-gold">{wordCount} words</span>
                </div>
                <textarea
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-parchment border-none rounded-2xl p-6 focus:ring-2 focus:ring-gold outline-none min-h-[400px] font-serif leading-relaxed text-lg"
                  placeholder="Begin writing here..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-parchment py-4 rounded-2xl font-medium hover:bg-ink/90 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {entries.map(entry => (
          <motion.div
            key={entry.id}
            whileHover={{ x: 4 }}
            onClick={() => { setSelectedEntry(entry); setFeedback(entry.feedback || ''); }}
            className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center gap-6"
          >
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", getTypeColor(entry.type))}>
              <PenTool size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded", getTypeColor(entry.type))}>
                  {entry.type}
                </span>
                <span className="text-xs text-ink/40">{entry.date?.seconds ? format(new Date(entry.date.seconds * 1000), 'MMM d, yyyy') : ''}</span>
                {entry.feedback && (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gold bg-gold/5 px-2 py-0.5 rounded">
                    <MessageSquare size={10} /> Feedback
                  </span>
                )}
              </div>
              <h3 className="text-xl font-serif text-ink truncate">{entry.title}</h3>
              <p className="text-sm text-ink/40 truncate mt-1">{entry.content.substring(0, 100)}...</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-ink/20">{entry.wordCount} words</div>
              <ChevronRight className="text-ink/10 ml-auto mt-1" size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-parchment w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-12 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded", getTypeColor(selectedEntry.type))}>
                      {selectedEntry.type}
                    </span>
                    <span className="text-xs text-ink/40">{selectedEntry.date?.seconds ? format(new Date(selectedEntry.date.seconds * 1000), 'MMMM d, yyyy') : ''}</span>
                  </div>
                  <h2 className="text-4xl font-serif text-ink">{selectedEntry.title}</h2>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="text-ink/40 hover:text-ink"><X size={32} /></button>
              </div>

              <div className="space-y-12">
                <div className="font-serif text-xl leading-relaxed text-ink/90 whitespace-pre-wrap first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                  {selectedEntry.content}
                </div>

                <div className="pt-10 border-t border-black/5">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-ink/40 mb-6">Teacher Feedback</h4>
                  {selectedEntry.feedback ? (
                    <div className="bg-gold/5 p-8 rounded-3xl border border-gold/10 relative">
                      <div className="absolute -top-3 left-8 bg-gold text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Teacher's Note
                      </div>
                      <p className="text-ink/80 italic font-serif text-lg leading-relaxed">
                        "{selectedEntry.feedback}"
                      </p>
                    </div>
                  ) : profile?.role === 'teacher' ? (
                    <div className="space-y-4">
                      <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl p-6 focus:ring-2 focus:ring-gold outline-none min-h-[120px]"
                        placeholder="Add your feedback here..."
                      />
                      <button
                        onClick={handleAddFeedback}
                        disabled={loading}
                        className="bg-gold text-white px-8 py-3 rounded-xl font-medium hover:bg-gold/90 transition-colors"
                      >
                        {loading ? 'Saving...' : 'Add Feedback'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-ink/40 italic">No feedback yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
