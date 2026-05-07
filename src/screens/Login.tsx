import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Mail, Lock, ArrowRight, Sun, Moon, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useTheme } from '../components/ThemeProvider';

import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// ─── Admin whitelist ──────────────────────────────────────────────────────────
// Only this email can access the admin panel. Any other account will be
// blocked and signed out immediately, even if Firebase auth succeeds.
const ADMIN_EMAIL = 'roboteam367@gmail.com';

export default function Login() {
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // ── Firestore profile sync ──────────────────────────────────────────────
  const syncUserRole = async (user: any, customRole?: 'citizen' | 'admin') => {
    const userRef = doc(db, 'users', user.uid);

    // Determine the correct role — admin only for the whitelisted email
    const isActualAdmin = user.email === ADMIN_EMAIL;
    const roleToSet = isActualAdmin ? 'admin' : 'citizen';

    try {
      let userDoc;
      try {
        userDoc = await getDoc(userRef);
      } catch (err) {
        return handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }

      if (!userDoc.exists()) {
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || email.split('@')[0],
            photoURL: user.photoURL,
            role: roleToSet,
            sensePoints: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          return handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      } else {
        const existingData = userDoc.data();
        try {
          // If the profile exists but the role is wrong for the whitelisted admin, fix it.
          const updateData: any = { updatedAt: serverTimestamp() };
          if (isActualAdmin && existingData?.role !== 'admin') {
            updateData.role = 'admin';
          }
          await updateDoc(userRef, updateData);
        } catch (err) {
          return handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        }
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
      throw error;
    }
  };

  // ── Admin email/password login ──────────────────────────────────────────
  const handleAdminAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side whitelist check before even hitting Firebase
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError('Access denied. This account is not authorised for admin access.');
      return;
    }

    if (!email || !password) {
      setError('Please enter Admin Usermail and App Keypass.');
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      try {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          result = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }

      // Double-check after Firebase auth resolves
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError('Access denied. This account is not authorised for admin access.');
        return;
      }

      await syncUserRole(result.user, 'admin');
      navigate('/admin');
    } catch (error: any) {
      console.error('Admin Auth Error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled in your Firebase project.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment before trying again.');
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Citizen email/password login ────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'admin') return handleAdminAction(e);

    setError('');
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserRole(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserRole(result.user);
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Auth Error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is disabled.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(isSignUp ? 'Sign up failed.' : 'Login failed. Check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Google sign-in ──────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInEmail = result.user.email ?? '';

      // If the user chose the Admin tab but isn't the whitelisted email, block them.
      if (role === 'admin' && signedInEmail !== ADMIN_EMAIL) {
        await signOut(auth);
        setError('Access denied. Only the authorised admin account can access this panel.');
        return;
      }

      await syncUserRole(result.user);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 bg-surface-container-lowest rounded-full shadow-lg border border-border text-slate-600 dark:text-slate-400 hover:text-primary transition-all"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Abstract Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-md max-w-md"
        >
          {/* Branding */}
          <div className="text-center mb-10">
            <div
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center space-x-3 mb-4 cursor-pointer group/logo"
            >
              <div className="w-12 h-12 civic-gradient rounded-xl flex items-center justify-center text-white shadow-sm group-hover/logo:scale-110 transition-transform">
                <Eye size={30} />
              </div>
              <span className="text-2xl font-black tracking-tight text-primary group-hover/logo:opacity-80 transition-opacity">Street Sense</span>
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              {role === 'admin' ? 'Admin Access Terminal' : 'Your Eyes on the Road'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium opacity-80">
              {role === 'admin'
                ? 'Authorized personnel only. Verification required.'
                : "Empowering Bangalore's communities through digital transparency."}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 ambient-shadow border border-border">
            {/* Role Toggle */}
            <div className="bg-surface-container-low p-1.5 rounded-full flex mb-8">
              <button
                onClick={() => { setRole('citizen'); setError(''); }}
                className={cn(
                  "flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all",
                  role === 'citizen' ? "civic-gradient text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-on-surface"
                )}
              >
                Citizen
              </button>
              <button
                onClick={() => { setRole('admin'); setError(''); }}
                className={cn(
                  "flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all",
                  role === 'admin' ? "bg-on-surface text-surface shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-on-surface"
                )}
              >
                Admin
              </button>
            </div>

            {/* Admin warning banner */}
            {role === 'admin' && (
              <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                <ShieldAlert size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                  Admin access is restricted to authorised accounts only. Unauthorised attempts are logged.
                </p>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface px-1 tracking-wider uppercase opacity-70">
                  {role === 'admin' ? 'Admin Usermail' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary transition-all outline-none text-lg text-on-surface placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                    placeholder={role === 'admin' ? 'admin@streetsense.gov' : 'name@example.com'}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-on-surface tracking-wider uppercase opacity-70">
                    {role === 'admin' ? 'App Keypass' : 'Password'}
                  </label>
                  {role !== 'admin' && (
                    <a className="text-xs font-bold text-primary hover:text-primary-container transition-colors" href="#">Forgot?</a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary transition-all outline-none text-lg text-on-surface placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-2">
                  <ShieldAlert size={16} className="text-error mt-0.5 shrink-0" />
                  <p className="text-sm text-error font-medium">{error}</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-4 rounded-full font-bold text-lg shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                    role === 'admin'
                      ? "bg-on-surface text-surface shadow-on-surface/10"
                      : "civic-gradient text-white shadow-primary/20"
                  )}
                >
                  <span>{isSubmitting ? 'Verifying...' : role === 'admin' ? 'Sign In as Admin' : (isSignUp ? 'Create Account' : 'Sign In')}</span>
                  <ArrowRight size={20} />
                </button>
                {role === 'admin' && (
                  <p className="text-[10px] text-center text-slate-400 mt-4 uppercase font-black tracking-widest leading-relaxed">
                    By signing in as admin, you agree to the <br />
                    <span className="text-primary cursor-pointer hover:underline">Moderator Code of Conduct</span>
                  </p>
                )}
              </div>
            </form>

            <div className="relative my-8 flex items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-4 text-xs font-bold text-slate-400 tracking-widest uppercase">Or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-surface-container-low text-on-surface rounded-full font-bold text-lg hover:bg-surface-container transition-colors flex items-center justify-center space-x-3"
            >
              <img
                alt="Google G Logo"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR_vYxkpxeFdqBTVcR2CvYh8qJkcSAs3aBrcoKtbQtg7qVn2SJ20wxaFgxlFQ8wqiuuPVWIJ2bfCQSnFWuNswlbJnYOw5gP3Y0KQw_A-S7O-FIVc4nK3fUigoW43fqW9gsgB0nMKMNbbFy6EAsbgLm62lSVo-M95okKusBVJ_c6Ov6Vb6LSGeyYFXBCMVFfCSjAmlmxfBhrgs-jaHyFiI3A58v77gr6KaqKbj4cB1bqeyR-9rgmFaWprTk_xTqHJd3nOCHUwWhQQ8"
              />
              <span>Continue with Google</span>
            </button>
          </div>

          {role !== 'admin' && (
            <div className="text-center mt-8 space-x-1">
              <span className="text-slate-500 dark:text-slate-400">
                {isSignUp ? 'Already have an account?' : 'New to Street Sense?'}
              </span>
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
              >
                {isSignUp ? 'Sign In' : 'Create an account'}
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="p-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-medium z-10">
        <div className="flex space-x-6 mb-4 md:mb-0">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Help Center</a>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>System Operational</span>
        </div>
      </footer>

      <div className="fixed inset-0 -z-10 opacity-5 grayscale pointer-events-none">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
