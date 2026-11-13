import { FormEvent, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Lock,
  Save,
} from 'lucide-react';
import { User } from '../types/unispace';

interface SettingsPageProps {
  user: User;
  onUpdatePassword: (newPassword: string) => void;
}

const PREFS_KEY = 'unispace_apu_settings_v1';

interface UserPrefs {
  bookingAlerts: boolean;
  checkInReminder: boolean;
}

function loadPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserPrefs>;
      return {
        bookingAlerts: parsed.bookingAlerts ?? true,
        checkInReminder: parsed.checkInReminder ?? true,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return { bookingAlerts: true, checkInReminder: true };
}

export function SettingsPage({ user, onUpdatePassword }: SettingsPageProps) {
  const initialPrefs = loadPrefs();
  const [bookingAlerts, setBookingAlerts] = useState(initialPrefs.bookingAlerts);
  const [checkInReminder, setCheckInReminder] = useState(
    initialPrefs.checkInReminder
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const wantsPasswordChange =
      Boolean(currentPassword) ||
      Boolean(newPassword) ||
      Boolean(confirmPassword);

    if (wantsPasswordChange) {
      if (currentPassword !== user.password) {
        setErrorMsg('Current password is incorrect.');
        return;
      }
      if (newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }
      onUpdatePassword(newPassword);
    }

    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ bookingAlerts, checkInReminder })
      );
    } catch {
      // Ignore storage write errors
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg(
      wantsPasswordChange
        ? 'Your password and settings have been updated.'
        : 'Your account settings have been saved.'
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-black">
          Settings
        </h2>
        <p className="mt-1.5 text-sm text-black">
          Configure your APU UniSpace notification preferences and account password.
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
        {/* Notification & Booking Preferences */}
        <section className="liquid-glass rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-900/[0.06]">
            <Bell className="w-4 h-4 text-[#007AFF]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-black">
              Preferences
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-900/[0.03] cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-black">
                  Booking confirmation alerts
                </p>
                <p className="text-xs text-black">
                  Receive instant notifications when a study room reservation is confirmed or updated.
                </p>
              </div>
              <input
                type="checkbox"
                checked={bookingAlerts}
                onChange={(e) => setBookingAlerts(e.target.checked)}
                className="w-5 h-5 rounded accent-[#007AFF] shrink-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-900/[0.03] cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-black">
                  Room check-in reminders
                </p>
                <p className="text-xs text-black">
                  Remind me 15 minutes before an upcoming APU booking so I can scan or show my check-in QR.
                </p>
              </div>
              <input
                type="checkbox"
                checked={checkInReminder}
                onChange={(e) => setCheckInReminder(e.target.checked)}
                className="w-5 h-5 rounded accent-[#007AFF] shrink-0 cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Change Password */}
        <section className="liquid-glass rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-900/[0.06]">
            <Lock className="w-4 h-4 text-[#007AFF]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-black">
              Security &amp; Password
            </h3>
          </div>
          <p className="text-xs text-black">
            Leave these fields blank if you do not wish to change your password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="pw-current"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                Current Password
              </label>
              <input
                id="pw-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="liquid-input w-full px-3.5 py-2.5 rounded-2xl text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="pw-new"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                New Password
              </label>
              <input
                id="pw-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="liquid-input w-full px-3.5 py-2.5 rounded-2xl text-sm text-black placeholder:text-black/45"
              />
            </div>

            <div>
              <label
                htmlFor="pw-confirm"
                className="block text-xs font-semibold text-black mb-1.5"
              >
                Confirm New Password
              </label>
              <input
                id="pw-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
