import { FormEvent, useState } from 'react';
import { Eye, Search, UserPlus, X } from 'lucide-react';
import { DEFAULT_TODAY } from '../data/seedData';
import { AccountStatus, User, UserRole } from '../types/unispace';
import { AccountStatusBadge } from './StatusBadge';

interface ManageUsersPageProps {
  users: User[];
  onAddLecturer: (user: User) => { ok: boolean; error?: string };
  onUpdateAccountStatus: (userId: string, status: AccountStatus) => void;
}

export function ManageUsersPage({
  users,
  onAddLecturer,
  onUpdateAccountStatus,
}: ManageUsersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'All'>('All');

  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Add lecturer form
  const [lecName, setLecName] = useState('');
  const [lecEmail, setLecEmail] = useState('');
  const [lecDept, setLecDept] = useState('School of Computing');
  const [lecStaffId, setLecStaffId] = useState('');
  const [lecPassword, setLecPassword] = useState('Password123!');
  const [lecError, setLecError] = useState('');

  const filtered = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (
      q &&
      !u.fullName.toLowerCase().includes(q) &&
      !u.email.toLowerCase().includes(q) &&
      !u.id.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.accountStatus !== statusFilter) return false;
    return true;
  });

  const handleCreateLecturer = (e: FormEvent) => {
    e.preventDefault();
    setLecError('');
    if (!lecName.trim() || !lecEmail.trim() || !lecStaffId.trim() || !lecPassword) {
      setLecError('All lecturer account fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lecEmail.trim())) {
      setLecError('Please enter a valid university email address.');
      return;
    }

    const newLecturer: User = {
      id: `USR-${2001 + users.length}`,
      fullName: lecName.trim(),
      email: lecEmail.trim().toLowerCase(),
      password: lecPassword,
      role: 'Lecturer',
      department: lecDept.trim() || 'Academic Faculty',
      studentOrStaffId: lecStaffId.trim(),
      accountStatus: 'Active',
      registrationDate: DEFAULT_TODAY,
    };

    const res = onAddLecturer(newLecturer);
    if (!res.ok) {
      setLecError(res.error || 'Could not add lecturer account.');
      return;
    }

    setAddOpen(false);
    setLecName('');
    setLecEmail('');
    setLecStaffId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-black">
            Manage Users
          </h2>
          <p className="mt-1.5 text-sm text-black">
            View campus accounts, provision lecturer credentials, and manage account status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLecError('');
            setAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_8px_20px_rgba(0,122,255,0.26)] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          <span>Add Lecturer Account</span>
        </button>
      </div>

      {/* Filters */}
      <div className="liquid-glass rounded-[26px] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search
            className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search users by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email..."
            className="liquid-input w-full pl-10 pr-4 py-2.5 rounded-full text-sm text-black placeholder:text-black/45"
          />
        </div>

        <select
          aria-label="Filter by user role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'All')}
          className="liquid-input px-4 py-2.5 rounded-full text-sm text-black"
        >
          <option value="All">All Roles</option>
          <option value="Student">Student</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Administrator">Administrator</option>
        </select>

        <select
          aria-label="Filter by account status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as AccountStatus | 'All')
          }
          className="liquid-input px-4 py-2.5 rounded-full text-sm text-black"
        >
          <option value="All">All Account Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="liquid-glass rounded-[28px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/[0.06] bg-slate-900/[0.025] text-xs font-semibold text-black">
                <th className="py-3.5 px-5">User ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/[0.05] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-black"
                  >
                    No user accounts match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-900/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono font-semibold text-black tabular-nums whitespace-nowrap">
                      {u.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-black whitespace-nowrap">
                      {u.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-black whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-black whitespace-nowrap">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        aria-label={`Update account status for ${u.fullName}`}
                        value={u.accountStatus}
                        disabled={u.role === 'Administrator'}
                        onChange={(e) =>
                          onUpdateAccountStatus(
                            u.id,
                            e.target.value as AccountStatus
                          )
                        }
                        className="liquid-input px-3 py-1.5 rounded-full text-xs font-medium text-black disabled:opacity-60"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-black tabular-nums whitespace-nowrap">
                      {u.registrationDate}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDetailUser(u)}
                        aria-label={`View details for ${u.fullName}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/[0.05] text-xs font-medium text-black hover:bg-slate-900/[0.09] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {detailUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-detail-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-md w-full p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-black">
                  {detailUser.id}
                </p>
                <h3
                  id="user-detail-title"
                  className="font-display text-lg font-bold text-black"
                >
                  {detailUser.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                aria-label="Close user detail modal"
                className="p-2 rounded-full text-black hover:text-black hover:bg-slate-900/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-sm border-t border-slate-900/[0.06] pt-4">
              <div className="flex justify-between gap-2">
                <span className="text-black">Email</span>
                <span className="font-medium text-black text-right">
                  {detailUser.email}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-black">Role</span>
                <span className="font-medium text-black">
                  {detailUser.role}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-black">Department</span>
                <span className="font-medium text-black text-right">
                  {detailUser.department}
                </span>
              </div>
              <div className="flex justify-between gap-2 tabular-nums">
                <span className="text-black">University ID</span>
                <span className="font-mono font-medium text-black">
                  {detailUser.studentOrStaffId}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-black">Status</span>
                <AccountStatusBadge status={detailUser.accountStatus} />
              </div>
              <div className="flex justify-between gap-2 tabular-nums">
                <span className="text-black">Registered</span>
                <span className="font-medium text-black">
                  {detailUser.registrationDate}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="px-5 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0066D6] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lecturer Modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-lecturer-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-md w-full p-6">
            <div className="flex items-center justify-between">
              <h3
                id="add-lecturer-title"
                className="font-display text-lg font-bold text-black"
              >
                Add Lecturer Account
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                aria-label="Close add lecturer dialog"
                className="p-2 rounded-full text-black hover:text-black hover:bg-slate-900/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {lecError && (
              <div
                role="alert"
                className="mt-4 rounded-2xl bg-[#E53935]/10 px-4 py-2.5 text-xs text-[#D32F2F]"
              >
                {lecError}
              </div>
            )}

            <form onSubmit={handleCreateLecturer} className="mt-4 space-y-3.5">
              <div>
                <label
                  htmlFor="lec-name"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  Full Name
                </label>
                <input
                  id="lec-name"
                  type="text"
                  value={lecName}
                  onChange={(e) => setLecName(e.target.value)}
                  placeholder="e.g. Dr. Priya Nair"
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                />
              </div>

              <div>
                <label
                  htmlFor="lec-email"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  University Email
                </label>
                <input
                  id="lec-email"
                  type="email"
                  value={lecEmail}
                  onChange={(e) => setLecEmail(e.target.value)}
                  placeholder="priya.nair@apu.edu.my"
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="lec-staff-id"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Staff ID
                  </label>
                  <input
                    id="lec-staff-id"
                    type="text"
                    value={lecStaffId}
                    onChange={(e) => setLecStaffId(e.target.value)}
                    placeholder="APU-LEC-210"
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lec-dept"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Department
                  </label>
                  <input
                    id="lec-dept"
                    type="text"
                    value={lecDept}
                    onChange={(e) => setLecDept(e.target.value)}
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lec-password"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  Temporary Password
                </label>
                <input
                  id="lec-password"
                  type="text"
                  value={lecPassword}
                  onChange={(e) => setLecPassword(e.target.value)}
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-900/[0.06] text-sm font-medium text-black hover:bg-slate-900/[0.10] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] cursor-pointer"
                >
                  Create Lecturer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
