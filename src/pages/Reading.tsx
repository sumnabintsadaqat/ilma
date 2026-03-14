import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { ReadingLog } from '../types';
import { BookMarked, Plus, X, Book } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Reading() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pagesRead, setPagesRead] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [notes, setNotes] = useState('');
  const [reflection, setReflection] = useState('');

  const fetchLogs = async () => {
    const q = query(collection(db, 'reading_logs'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReadingLog)));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'reading_logs'), {
        title,
        author,
        pagesRead,
        totalPages,
        notes,
        reflection,
        date: Timestamp.now()
      });
      setShowForm(false);
      setTitle('');
      setAuthor('');
      setPagesRead(0);
      setTotalPages(0);
      setNotes('');
      setReflection('');
      fetchLogs();
    } catch (error) {
      console.error('Error adding reading log:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    sessions: logs.length,
    uniqueBooks: new Set(logs.map(l => l.title)).size,
    totalPages: logs.reduce((acc, l) => acc + l.pagesRead, 0)
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif text-ink">Reading Log</h1>
          <p className="text-ink/60 mt-1">A journey through timeless literature</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-ink text-parchment px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-ink/90 transition-colors"
        >
          <Plus size={20} /> Log Reading
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Sessions', value: stats.sessions },
          { label: 'Books Read', value: stats.uniqueBooks },
          { label: 'Total Pages', value: stats.totalPages },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm text-center">
            <div className="text-3xl font-serif text-ink mb-1">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider font-bold text-ink/40">{stat.label}</div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-lg space-y-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-serif text-ink">New Reading Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-ink/40 hover:text-ink"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Book Title</label>
                  <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                    placeholder="e.g. The Alchemist"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Author</label>
                  <input
                    required
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                    placeholder="e.g. Paulo Coelho"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Pages Read Today</label>
                  <input
                    type="number"
                    required
                    value={pagesRead}
                    onChange={e => setPagesRead(parseInt(e.target.value))}
                    className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Total Pages in Book</label>
                  <input
                    type="number"
                    required
                    value={totalPages}
                    onChange={e => setTotalPages(parseInt(e.target.value))}
                    className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none min-h-[80px]"
                  placeholder="General notes on the session..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-ink/40">Reflection</label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  className="w-full bg-parchment border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none min-h-[100px]"
                  placeholder="What did this make you think about?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-white py-3 rounded-xl font-medium hover:bg-gold/90 transition-colors"
              >
                {loading ? 'Saving...' : 'Log Reading Session'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {logs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-black/10">
            <p className="text-gold arabic-naskh text-4xl mb-4">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p>
            <p className="text-ink/40 italic font-serif mb-8">"Read in the name of your Lord who created"</p>
            <button onClick={() => setShowForm(true)} className="bg-ink text-parchment px-8 py-3 rounded-xl font-medium hover:bg-ink/90 transition-colors">
              Log your first book
            </button>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm flex gap-8">
              <div className="w-16 h-16 rounded-2xl bg-parchment flex items-center justify-center text-gold shadow-inner">
                <Book size={32} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif text-ink">{log.title}</h3>
                    <p className="text-ink/60">by {log.author}</p>
                  </div>
                  <span className="text-xs text-ink/40">{log.date?.seconds ? format(new Date(log.date.seconds * 1000), 'MMM d, yyyy') : ''}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-ink/40">
                    <span>Progress</span>
                    <span>{Math.round((log.pagesRead / log.totalPages) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-parchment rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sage transition-all duration-1000" 
                      style={{ width: `${(log.pagesRead / log.totalPages) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5">
                  <p className="text-ink/80 italic font-serif leading-relaxed">"{log.reflection}"</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
