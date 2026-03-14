import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { HifzSession } from '../types';
import { Star, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { SURAHS } from '../constants';

export default function Hifz() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<HifzSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [juz, setJuz] = useState<number | null>(null);
  const [fromSurah, setFromSurah] = useState(SURAHS[0]);
  const [fromAyah, setFromAyah] = useState(1);
  const [toSurah, setToSurah] = useState(SURAHS[0]);
  const [toAyah, setToAyah] = useState(1);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');

  const fetchSessions = async () => {
    const q = query(collection(db, 'hifz_sessions'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as HifzSession)));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (juz === null) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'hifz_sessions'), {
        juz,
        fromSurah,
        fromAyah,
        toSurah,
        toAyah,
        quality,
        notes,
        date: Timestamp.now()
      });
      setShowForm(false);
      setJuz(null);
      setQuality(3);
      setNotes('');
      fetchSessions();
    } catch (error) {
      console.error('Error adding hifz session:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJuzQuality = (juzNum: number) => {
    const juzSessions = sessions.filter(s => s.juz === juzNum);
    if (juzSessions.length === 0) return 0;
    return juzSessions[0].quality; // Most recent
  };

  const getQualityColor = (q: number) => {
    switch (q) {
      case 5: return 'bg-sage text-white';
      case 4: return 'bg-sage/60 text-white';
      case 3: return 'bg-gold text-white';
      case 2: return 'bg-gold/40 text-ink';
      case 1: return 'bg-red-200 text-ink';
      default: return 'bg-ink/5 text-ink/20';
    }
  };

  const getQualityLabel = (q: number) => {
    switch (q) {
      case 5: return 'Excellent';
      case 4: return 'Very good';
      case 3: return 'Good';
      case 2: return 'Needs work';
      case 1: return 'Needs much work';
      default: return '';
    }
  };

  const revisedJuzCount = new Set(sessions.map(s => s.juz)).size;
  const avgQuality = sessions.length > 0 
    ? (sessions.reduce((acc, s) => acc + s.quality, 0) / sessions.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-gold arabic-naskh text-6xl">مراجعة الحفظ</h1>
        <p className="text-ink/60 font-serif italic">Revision of Memorization</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revision Sessions', value: sessions.length },
          { label: 'Juz Revised', value: `${revisedJuzCount}/30` },
          { label: 'Average Quality', value: avgQuality },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm text-center">
            <div className="text-4xl font-serif text-ink mb-2">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider font-bold text-ink/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Juz Grid */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm">
        <h2 className="text-2xl font-serif text-ink mb-8 text-center">The 30 Juz Grid</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(j => {
            const q = getJuzQuality(j);
            return (
              <div
                key={j}
                className={clsx(
                  "aspect-square rounded-xl flex items-center justify-center font-serif text-xl transition-all shadow-sm",
                  getQualityColor(q)
                )}
                title={`Juz ${j}: ${getQualityLabel(q)}`}
              >
                {j}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-ink">Recent Sessions</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-ink text-parchment px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-ink/90 transition-colors"
        >
          <Plus size={20} /> Log Revision
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-parchment w-full max-w-2xl rounded-[2rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif text-ink">Log Revision Session</h2>
                <button onClick={() => setShowForm(false)} className="text-ink/40 hover:text-ink"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40 block">Select Juz</label>
                  <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => setJuz(j)}
                        className={clsx(
                          "aspect-square rounded-lg font-serif text-lg transition-all border",
                          juz === j ? "bg-gold text-white border-gold shadow-md" : "bg-white text-ink/60 border-black/5 hover:border-gold"
                        )}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs uppercase tracking-wider font-bold text-ink/40 block">From</label>
                    <div className="flex gap-2">
                      <select 
                        value={fromSurah} 
                        onChange={e => setFromSurah(e.target.value)}
                        className="flex-1 bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                      >
                        {SURAHS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input
                        type="number"
                        value={fromAyah}
                        onChange={e => setFromAyah(parseInt(e.target.value))}
                        className="w-20 bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                        placeholder="Ayah"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs uppercase tracking-wider font-bold text-ink/40 block">To</label>
                    <div className="flex gap-2">
                      <select 
                        value={toSurah} 
                        onChange={e => setToSurah(e.target.value)}
                        className="flex-1 bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                      >
                        {SURAHS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input
                        type="number"
                        value={toAyah}
                        onChange={e => setToAyah(parseInt(e.target.value))}
                        className="w-20 bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-gold outline-none"
                        placeholder="Ayah"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40 block">Quality of Revision</label>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setQuality(star)}
                          className={clsx(
                            "transition-all",
                            star <= quality ? "text-gold scale-110" : "text-ink/10"
                          )}
                        >
                          <Star size={32} fill={star <= quality ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <span className="text-gold font-serif text-xl">{getQualityLabel(quality)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-ink/40 block">Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-white border-none rounded-xl p-4 focus:ring-2 focus:ring-gold outline-none min-h-[100px]"
                    placeholder="Reflections on this revision..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || juz === null}
                  className="w-full bg-ink text-parchment py-4 rounded-2xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Log Revision'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-6">
            <div className={clsx(
              "w-14 h-14 rounded-full flex items-center justify-center text-white font-serif text-2xl shadow-sm",
              getQualityColor(session.quality)
            )}>
              {session.juz}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-serif text-ink">{session.fromSurah} ({session.fromAyah}) - {session.toSurah} ({session.toAyah})</h3>
                <span className="text-xs text-ink/40">{session.date?.seconds ? format(new Date(session.date.seconds * 1000), 'MMM d, yyyy') : ''}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < session.quality ? 'currentColor' : 'none'} className={i < session.quality ? '' : 'opacity-20'} />
                  ))}
                </div>
                <p className="text-sm text-ink/60 italic">{session.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
