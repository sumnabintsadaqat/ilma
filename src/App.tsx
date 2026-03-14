/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import Hifz from './pages/Hifz';
import Projects from './pages/Projects';
import Reading from './pages/Reading';
import Writing from './pages/Writing';
import { PRE_SEEDED_PROJECTS } from './constants';
import { collection, getDocs, addDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ uid: firebaseUser.uid, ...docSnap.data() } as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const seedProjects = async (studentUid: string) => {
    const projectsRef = collection(db, 'projects');
    const q = await getDocs(projectsRef);
    if (q.empty) {
      for (const p of PRE_SEEDED_PROJECTS) {
        await addDoc(projectsRef, { ...p, studentUid, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-gold font-serif text-2xl animate-pulse">Loading Ilm...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <Router>
        <Routes>
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={user ? (profile ? <Layout /> : <Auth />) : <Navigate to="/auth" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="hifz" element={<Hifz />} />
            <Route path="projects" element={<Projects />} />
            <Route path="reading" element={<Reading />} />
            <Route path="writing" element={<Writing />} />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
