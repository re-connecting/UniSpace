import { FormEvent, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Save,
  User as UserIcon,
} from 'lucide-react';
import { User } from '../types/unispace';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (updates: {
    fullName: string;
    department: string;
  }) => void;
}

export function ProfilePage({ user, onUpdateProfile }: ProfilePageProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [department, setDepartment] = useState(user.department);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    onUpdateProfile({
      fullName: fullName.trim(),
      department: department.trim() || user.department,
    });
    setSuccessMsg('Your APU profile information has been updated.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-black">
          Profile
        </h2>
        <p className="mt-1.5 text-sm text-black">
          Asia Pacific University of Technology and Innovation (APU) identity details. Role, TP/Staff ID, and APU email are managed by APU Centre for Technology &amp; Innovation (CTI).
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-2xl bg-[#E53935]/10 px-4 py-3 text-sm text-[#D32F2F] flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="rounded-2xl bg-[#1F9D55]/12 px-4 py-3 text-sm text-[#177E43] flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="liquid-glass rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-900/[0.06]">
            <UserIcon className="w-4 h-4 text-[#007AFF]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-black">
              APU Profile Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="liquid-input w-full px-3.5 py-2.5 rounded-2xl text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                APU Email (Read-only)
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-900/[0.06] bg-slate-900/[0.04] text-sm text-black cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="profile-role"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                Assigned Role (Read-only)
              </label>
              <input
                id="profile-role"
                type="text"
                value={user.role}
                disabled
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-900/[0.06] bg-slate-900/[0.04] text-sm text-black cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="profile-id"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                TP / Staff ID (Read-only)
              </label>
              <input
                id="profile-id"
                type="text"
                value={user.studentOrStaffId}
                disabled
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-900/[0.06] bg-slate-900/[0.04] font-mono text-sm text-black cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="profile-dept"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                School / Faculty
              </label>
              <input
                id="profile-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="liquid-input w-full px-3.5 py-2.5 rounded-2xl text-sm text-black"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_8px_20px_rgba(0,122,255,0.26)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
