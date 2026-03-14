import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserRole } from '../types';

export default function Auth() {
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName || 'User',
          email: user.email,
          role: role,
        });
      }
      // App.tsx will pick up the auth change and profile
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in window was closed before completion. Please try again.');
      } else if (err.code === 'auth/blocked-at-popup-manager') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError('An error occurred during sign-in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-black/5 text-center">
        <h1 className="text-4xl font-serif mb-2">Ilm</h1>
        <p className="text-gold arabic-naskh text-2xl mb-6">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        
        <div className="mb-8">
          <p className="text-ink/60 italic mb-4">
            "Seeking knowledge is an obligation upon every Muslim"
            <br />
            <span className="arabic-naskh text-lg">طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ</span>
          </p>
        </div>

        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setRole('student')}
            className={`px-6 py-2 rounded-full transition-all ${
              role === 'student' ? 'bg-gold text-white shadow-md' : 'bg-parchment text-ink/60'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`px-6 py-2 rounded-full transition-all ${
              role === 'teacher' ? 'bg-sage text-white shadow-md' : 'bg-parchment text-ink/60'
            }`}
          >
            Teacher
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-ink text-parchment py-3 rounded-xl font-medium hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}
