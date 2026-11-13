import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
  X,
} from 'lucide-react';
import { CAMPUS_LOGIN_HERO_IMAGE } from '../data/seedData';
import { User } from '../types/unispace';
import { SpaceImage } from './SpaceImage';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User, rememberMe: boolean) => void;
  onRegisterStudent: (payload: {
    fullName: string;
    email: string;
    department: string;
    studentId: string;
    password: string;
  }) => { ok: boolean; error?: string; user?: User };
}

export function LoginPage({
  users,
  onLogin,
  onRegisterStudent,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Registration modal
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('School of Computing');
  const [regStudentId, setRegStudentId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both your university email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid university email address.');
      return;
    }

    const found = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (!found) {
      setErrorMsg(
        'Incorrect email or password. Check your credentials or use a demo account below.'
      );
      return;
    }

    if (found.accountStatus === 'Suspended') {
      setErrorMsg(
        'This account is currently suspended. Please contact APU Centre for Technology & Innovation (CTI).'
      );
      return;
    }

    onLogin(found, rememberMe);
  };

  const fillSampleAccount = (sampleEmail: string) => {
    setEmail(sampleEmail);
    setPassword('Password123!');
    setErrorMsg('');
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regStudentId.trim() || !regPassword) {
      setRegError('All registration fields are required.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }

    const res = onRegisterStudent({
      fullName: regName.trim(),
      email: regEmail.trim(),
      department: regDept.trim(),
      studentId: regStudentId.trim(),
      password: regPassword,
    });

    if (!res.ok) {
      setRegError(res.error || 'Could not create student account.');
      return;
    }

    if (res.user) {
      setRegisterOpen(false);
      onLogin(res.user, true);
    }
  };

  const sampleAccounts = [
    {
      role: 'Student',
      name: 'Alex Tan',
      email: 'tp074128@mail.apu.edu.my',
      desc: 'Discover APU rooms, book desks & manage bookings',
    },
    {
      role: 'Lecturer',
      name: 'Dr. Sarah Lim',
      email: 'sarah.lim@apu.edu.my',
      desc: 'Reserve tutorial & consultation rooms',
    },
    {
      role: 'Administrator',
      name: 'Elena Vance',
      email: 'admin@apu.edu.my',
      desc: 'Manage APU campus spaces, people & analytics',
    },
  ];

  return (
    <div className="min-h-screen relative bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left: Floating Liquid Glass Form Surface */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-md mx-auto liquid-glass rounded-[32px] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007AFF] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(0,122,255,0.28)]">
              <Building2 className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-black tracking-tight block leading-none">
                UniSpace
              </span>
              <span className="text-xs text-black mt-1 block">
                Asia Pacific University of Technology and Innovation (APU)
              </span>
            </div>
          </div>

          <div className="mt-7">
            <h1 className="font-display text-2xl sm:text-[28px] font-bold text-black tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-black leading-relaxed">
              Sign in with your APU email to check live room availability and book a study space.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mt-5 rounded-2xl bg-[#E53935]/10 px-4 py-3 text-sm text-[#C62828]"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                University Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tp074128@mail.apu.edu.my"
                  className="liquid-input w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm text-black placeholder:text-black/45"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="liquid-input w-full pl-10 pr-11 py-2.5 rounded-2xl text-sm text-black placeholder:text-black/45"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-black hover:text-black cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#007AFF]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSubmitted(false);
                  setForgotOpen(true);
                }}
                className="text-xs font-semibold text-[#007AFF] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_8px_20px_rgba(0,122,255,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007AFF] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Sign In to UniSpace</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-black">
            New student?{' '}
            <button
              type="button"
              onClick={() => {
                setRegError('');
                setRegisterOpen(true);
              }}
              className="font-semibold text-[#007AFF] hover:underline cursor-pointer"
            >
              Create a student account
            </button>
          </div>

          {/* Prototype Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-900/[0.06]">
            <h2 className="text-xs font-semibold text-black mb-2.5">
              Quick Demo Accounts (Password: Password123!)
            </h2>
            <div className="space-y-2">
              {sampleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillSampleAccount(acc.email)}
                  className="w-full text-left px-3.5 py-2.5 rounded-2xl bg-slate-900/[0.035] hover:bg-[#007AFF]/[0.08] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-black">
                      {acc.role} · {acc.name}
                    </p>
                    <p className="text-[11px] text-black truncate">
                      {acc.email} — {acc.desc}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#007AFF] whitespace-nowrap shrink-0">
                    Fill Credentials
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Campus Visual with Floating Liquid Glass Overlay Card */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] p-5 pl-0">
        <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <SpaceImage
            src={CAMPUS_LOGIN_HERO_IMAGE}
            alt="Sunlit university library atrium and collaborative glass study pods"
            title="UniSpace Campus Library"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent"
            aria-hidden="true"
          />
          <div className="relative z-10 h-full flex flex-col justify-end p-8">
            <div className="rounded-[24px] bg-white/15 backdrop-blur-2xl border border-white/25 p-6 text-white shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
              <p className="text-xs font-semibold text-sky-200">
                Asia Pacific University of Technology and Innovation
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold leading-snug text-balance">
                Every quiet desk, discussion room, lab, and tutorial room at APU in one clear view.
              </h2>
              <p className="mt-2 text-sm text-white/85 leading-relaxed">
                Search by APU room code (e.g., B-09-03 = Block B, Level 9, Room 03) or scan a wall QR to reserve in seconds.
              </p>
              <div className="mt-5 pt-4 border-t border-white/20 flex items-center gap-8 text-xs text-white/85 tabular-nums">
                <div>
                  <span className="font-display text-base font-bold text-white block">
                    APU Campus
                  </span>
                  <span>Bukit Jalil, Kuala Lumpur</span>
                </div>
                <div>
                  <span className="font-display text-base font-bold text-white block">
                    Instant Booking
                  </span>
                  <span>Live slot &amp; conflict checks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-md w-full p-6">
            <div className="flex items-center justify-between">
              <h2
                id="forgot-modal-title"
                className="font-display text-lg font-bold text-black"
              >
                Reset University Password
              </h2>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                aria-label="Close reset password modal"
                className="p-1.5 rounded-full text-black hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {forgotSubmitted ? (
              <div className="mt-4">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1F9D55]/10 text-sm text-[#147A40]">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>
                    If an account exists for <strong>{forgotEmail}</strong>, a password reset link has been queued by APU Centre for Technology &amp; Innovation (CTI).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="mt-5 w-full px-4 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) return;
                  setForgotSubmitted(true);
                }}
                className="mt-4 space-y-4"
              >
                <p className="text-sm text-black">
                  Enter your university email address and we will send password recovery instructions.
                </p>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-semibold text-black mb-1.5"
                  >
                    University Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tp074128@mail.apu.edu.my"
                    className="liquid-input w-full px-3.5 py-2.5 rounded-2xl text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="px-4 py-2 rounded-full bg-slate-900/[0.05] text-sm font-medium text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Student Registration Modal */}
      {registerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-modal-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-md w-full p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#007AFF]" />
                <h2
                  id="register-modal-title"
                  className="font-display text-lg font-bold text-black"
                >
                  Student Registration
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setRegisterOpen(false)}
                aria-label="Close registration modal"
                className="p-1.5 rounded-full text-black hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regError && (
              <div
                role="alert"
                className="mt-4 rounded-2xl bg-[#E53935]/10 px-3.5 py-2.5 text-xs text-[#C62828]"
              >
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  University Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tp074128@mail.apu.edu.my"
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-sid"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Student ID
                  </label>
                  <input
                    id="reg-sid"
                    type="text"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="TP074128"
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-dept"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Faculty / School
                  </label>
                  <input
                    id="reg-dept"
                    type="text"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  Password (min. 8 characters)
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a password"
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-900/[0.05] text-sm font-medium text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold cursor-pointer"
                >
                  Register & Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
