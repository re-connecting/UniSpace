import { useState } from 'react';
import { Eye, Search, X, XCircle } from 'lucide-react';
import {
  Reservation,
  ReservationStatus,
  StudySpace,
  User,
} from '../types/unispace';
import { ConfirmDialog } from './ConfirmDialog';
import { ReservationStatusBadge } from './StatusBadge';

interface ManageReservationsPageProps {
  reservations: Reservation[];
  spaces: StudySpace[];
  users: User[];
  onUpdateStatus: (reservationId: string, status: ReservationStatus) => void;
}

export function ManageReservationsPage({
  reservations,
  spaces,
  users,
  onUpdateStatus,
}: ManageReservationsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'All'>('All');
  const [dateFilter, setDateFilter] = useState('');
  const [detailRes, setDetailRes] = useState<Reservation | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const filtered = reservations
    .filter((res) => {
      const user = users.find((u) => u.id === res.userId);
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchId = res.id.toLowerCase().includes(q);
        const matchUser = user?.fullName.toLowerCase().includes(q) ?? false;
        if (!matchId && !matchUser) return false;
      }
      if (statusFilter !== 'All' && res.status !== statusFilter) return false;
      if (dateFilter && res.date !== dateFilter) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime));

  const detailUser = detailRes
    ? users.find((u) => u.id === detailRes.userId)
    : undefined;
  const detailSpace = detailRes
    ? spaces.find((s) => s.id === detailRes.spaceId)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-black">
          Manage Reservations
        </h2>
        <p className="mt-1.5 text-sm text-black">
          Review campus bookings, update reservation statuses, or cancel conflicting slots.
        </p>
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
            aria-label="Search by booking ID or user name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Booking ID or user..."
            className="liquid-input w-full pl-10 pr-4 py-2.5 rounded-full text-sm text-black placeholder:text-black/45"
          />
        </div>

        <select
          aria-label="Filter by reservation status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ReservationStatus | 'All')
          }
          className="liquid-input px-4 py-2.5 rounded-full text-sm text-black"
        >
          <option value="All">All Reservation Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            aria-label="Filter by date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="liquid-input flex-1 px-4 py-2.5 rounded-full text-sm text-black tabular-nums"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="px-4 py-2 rounded-full bg-slate-900/[0.06] text-xs font-semibold text-black hover:bg-slate-900/[0.10] cursor-pointer whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="liquid-glass rounded-[28px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/[0.06] bg-slate-900/[0.025] text-xs font-semibold text-black">
                <th className="py-3.5 px-5">Booking ID</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Study Space</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Start</th>
                <th className="py-3.5 px-4">End</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/[0.05] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-sm text-black"
                  >
                    No reservations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((res) => {
                  const user = users.find((u) => u.id === res.userId);
                  const space = spaces.find((s) => s.id === res.spaceId);
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-900/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-semibold text-black tabular-nums whitespace-nowrap">
                        {res.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-black whitespace-nowrap">
                        {user ? user.fullName : res.userId}
                      </td>
                      <td className="py-3.5 px-4 text-black whitespace-nowrap">
                        {user ? user.role : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-black whitespace-nowrap">
                        {space ? space.name : res.spaceId}
                      </td>
                      <td className="py-3.5 px-4 text-black tabular-nums whitespace-nowrap">
                        {res.date}
                      </td>
                      <td className="py-3.5 px-4 text-black tabular-nums whitespace-nowrap">
                        {res.startTime}
                      </td>
                      <td className="py-3.5 px-4 text-black tabular-nums whitespace-nowrap">
                        {res.endTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          aria-label={`Update status for ${res.id}`}
                          value={res.status}
                          onChange={(e) =>
                            onUpdateStatus(
                              res.id,
                              e.target.value as ReservationStatus
                            )
                          }
                          className="liquid-input px-3 py-1.5 rounded-full text-xs font-medium text-black"
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailRes(res)}
                            aria-label={`View reservation ${res.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/[0.05] text-xs font-medium text-black hover:bg-slate-900/[0.09] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>View</span>
                          </button>
                          {res.status === 'Upcoming' && (
                            <button
                              type="button"
                              onClick={() => setCancelTargetId(res.id)}
                              aria-label={`Cancel reservation ${res.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E53935]/[0.10] text-xs font-medium text-[#D32F2F] hover:bg-[#E53935]/[0.18] transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Reservation Details Modal */}
      {detailRes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-res-detail-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-md w-full p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-black">
                  {detailRes.id}
                </p>
                <h3
                  id="admin-res-detail-title"
                  className="font-display text-lg font-bold text-black"
                >
                  Reservation Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailRes(null)}
                aria-label="Close reservation detail dialog"
                className="p-2 rounded-full text-black hover:text-black hover:bg-slate-900/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-sm border-t border-slate-900/[0.06] pt-4">
              <div className="flex justify-between gap-2">
                <span className="text-black">User</span>
                <span className="font-medium text-black text-right">
                  {detailUser
                    ? `${detailUser.fullName} (${detailUser.role})`
                    : detailRes.userId}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-black">Space</span>
                <span className="font-medium text-black text-right">
                  {detailSpace
                    ? `${detailSpace.name} (${detailSpace.building})`
                    : detailRes.spaceId}
                </span>
              </div>
              <div className="flex justify-between gap-2 tabular-nums">
                <span className="text-black">Date & Time</span>
                <span className="font-medium text-black">
                  {detailRes.date} · {detailRes.startTime}–{detailRes.endTime}
                </span>
              </div>
              <div className="flex justify-between gap-2 tabular-nums">
                <span className="text-black">Group Size</span>
                <span className="font-medium text-black">
                  {detailRes.attendees} attendees
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-black">Purpose</span>
                <span className="font-medium text-black">
                  {detailRes.purpose}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-black">Status</span>
                <ReservationStatusBadge status={detailRes.status} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailRes(null)}
                className="px-5 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0066D6] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTargetId)}
        title="Cancel User Reservation?"
        description={`Cancel reservation ${cancelTargetId}? The user will see the updated Cancelled status and the slot will become available.`}
        confirmLabel="Cancel Reservation"
        cancelLabel="Keep Booking"
        tone="danger"
        onCancel={() => setCancelTargetId(null)}
        onConfirm={() => {
          if (cancelTargetId) {
            onUpdateStatus(cancelTargetId, 'Cancelled');
            setCancelTargetId(null);
          }
        }}
      />
    </div>
  );
}
