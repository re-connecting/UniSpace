import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Clock,
  MessageSquare,
  QrCode,
  Search,
  Users,
} from 'lucide-react';
import {
  Reservation,
  SpaceType,
  StudySpace,
  User,
} from '../types/unispace';
import { SpaceCard } from './SpaceCard';
import { ReservationStatusBadge } from './StatusBadge';

interface LecturerDashboardProps {
  user: User;
  spaces: StudySpace[];
  reservations: Reservation[];
  onQuickRoomFilter: (payload: {
    query?: string;
    spaceType?: SpaceType | 'All';
    minCapacity?: number | 'All';
  }) => void;
  onOpenQrScanner: () => void;
  onViewSpaceDetails: (spaceId: string) => void;
  onViewReservations: () => void;
}

export function LecturerDashboard({
  user,
  spaces,
  reservations,
  onQuickRoomFilter,
  onOpenQrScanner,
  onViewSpaceDetails,
  onViewReservations,
}: LecturerDashboardProps) {
  const [query, setQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState<number | 'All'>('All');

  const activeSpaces = spaces.filter((s) => s.isActive);
  const availableRooms = activeSpaces.filter(
    (s) =>
      s.occupancyStatus === 'Available' &&
      s.spaceType !== 'Individual Desk'
  );

  const myReservations = reservations
    .filter((r) => r.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const myUpcoming = myReservations.filter((r) => r.status === 'Upcoming');

  const recommendedTutorialRooms = activeSpaces
    .filter(
      (s) =>
        s.occupancyStatus !== 'Maintenance' &&
        (s.spaceType === 'Tutorial Room' ||
          s.spaceType === 'Consultation Room' ||
          s.spaceType === 'Discussion Room')
    )
    .sort((a, b) => {
      if (a.spaceType === 'Tutorial Room' && b.spaceType !== 'Tutorial Room')
        return -1;
      return b.capacity - a.capacity;
    })
    .slice(0, 3);

  const handleQuickSearch = (e: FormEvent) => {
    e.preventDefault();
    onQuickRoomFilter({ query, minCapacity, spaceType: 'All' });
  };

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-black text-balance">
            Hi, {user.fullName}
          </h2>
          <p className="mt-1.5 text-sm text-black max-w-2xl leading-relaxed">
            {user.department} · Book equipped tutorial rooms, consultation suites, and group critique spaces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenQrScanner}
            className="liquid-glass inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-black hover:bg-slate-900/[0.04] transition-all cursor-pointer whitespace-nowrap"
          >
            <QrCode className="w-4 h-4 text-[#007AFF]" aria-hidden="true" />
            <span>Scan Room QR</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickRoomFilter({ spaceType: 'All' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_8px_20px_rgba(0,122,255,0.26)] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <span>Browse All Academic Rooms</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Unified Glass Summary Strip */}
      <section className="liquid-glass rounded-[28px] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/[0.07]">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-black">
            Available Rooms
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-black tabular-nums">
            {availableRooms.length}
          </p>
          <p className="mt-1 text-xs text-black">
            Tutorial, consultation, lab & discussion spaces
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-black">
            Upcoming Sessions
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-[#007AFF] tabular-nums">
            {myUpcoming.length}
          </p>
          <p className="mt-1 text-xs text-black truncate">
            {myUpcoming[0]
              ? `Next: ${myUpcoming[0].date} · ${myUpcoming[0].startTime}`
              : 'No upcoming teaching bookings'}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-black">
            Tutorial Rooms
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-black tabular-nums">
            {
              activeSpaces.filter(
                (s) =>
                  s.spaceType === 'Tutorial Room' &&
                  s.occupancyStatus !== 'Maintenance'
              ).length
            }
          </p>
          <p className="mt-1 text-xs text-black">
            Projectors & whiteboards ready
          </p>
        </div>
      </section>

      {/* Academic Booking Shortcuts */}
      <section aria-label="Lecturer Booking Shortcuts">
        <h3 className="font-display text-base font-bold text-black mb-3">
          Quick Room Shortcuts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() =>
              onQuickRoomFilter({ spaceType: 'Tutorial Room', minCapacity: 10 })
            }
            className="text-left liquid-glass rounded-[24px] p-5 hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
            </div>
            <p className="font-display text-sm font-bold text-black group-hover:text-[#007AFF] transition-colors">
              Book Tutorial Room
            </p>
            <p className="mt-1 text-xs text-black">
              Seminar & lecture rooms (16–20 seats) with projectors.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onQuickRoomFilter({ spaceType: 'Consultation Room' })
            }
            className="text-left liquid-glass rounded-[24px] p-5 hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#1F9D55]/12 text-[#147A40] flex items-center justify-center mb-3">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
            </div>
            <p className="font-display text-sm font-bold text-black group-hover:text-[#007AFF] transition-colors">
              Book Consultation Room
            </p>
            <p className="mt-1 text-xs text-black">
              Private suites for office hours and thesis supervision.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onQuickRoomFilter({ spaceType: 'Discussion Room', minCapacity: 6 })
            }
            className="text-left liquid-glass rounded-[24px] p-5 hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#C77700]/12 text-[#9A5B00] flex items-center justify-center mb-3">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
            <p className="font-display text-sm font-bold text-black group-hover:text-[#007AFF] transition-colors">
              Reserve Discussion Room
            </p>
            <p className="mt-1 text-xs text-black">
              Collaborative critique rooms with whiteboards.
            </p>
          </button>
        </div>
      </section>

      {/* Spotlight Search */}
      <section className="liquid-glass rounded-[28px] p-3 sm:p-3.5">
        <form
          onSubmit={handleQuickSearch}
          className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
        >
          <div className="md:col-span-6 relative">
            <Search
              className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              aria-label="Search rooms by name or equipment"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projector, whiteboard, Block B..."
              className="liquid-input w-full pl-10 pr-4 py-2.5 rounded-full text-sm"
            />
          </div>
          <div className="md:col-span-4">
            <select
              aria-label="Room capacity"
              value={minCapacity}
              onChange={(e) =>
                setMinCapacity(
                  e.target.value === 'All' ? 'All' : Number(e.target.value)
                )
              }
              className="liquid-input w-full px-4 py-2.5 rounded-full text-sm"
            >
              <option value="All">Any Room Capacity</option>
              <option value="4">4+ seats (Consultation / Small Group)</option>
              <option value="8">8+ seats (Discussion Seminar)</option>
              <option value="16">16+ seats (Tutorial Class)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] cursor-pointer whitespace-nowrap"
            >
              Find Rooms
            </button>
          </div>
        </form>
      </section>

      {/* Recommended Tutorial & Academic Rooms */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-black">
              Recommended Academic Rooms
            </h3>
            <p className="text-xs text-black mt-0.5">
              Rooms with projectors, whiteboards, and campus Wi-Fi
            </p>
          </div>
          <button
            type="button"
            onClick={() => onQuickRoomFilter({ spaceType: 'All' })}
            className="text-sm font-semibold text-[#007AFF] hover:underline cursor-pointer whitespace-nowrap"
          >
            See all rooms
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedTutorialRooms.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onViewDetails={onViewSpaceDetails}
            />
          ))}
        </div>
      </section>

      {/* Recent Reservation Activities */}
      <section className="liquid-glass rounded-[28px] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-900/[0.06] flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-black">
              Recent Academic Bookings
            </h3>
            <p className="text-xs text-black mt-0.5">
              Upcoming tutorials, consultations, and past sessions
            </p>
          </div>
          <button
            type="button"
            onClick={onViewReservations}
            className="text-sm font-semibold text-[#007AFF] hover:underline cursor-pointer whitespace-nowrap"
          >
            Manage All
          </button>
        </div>

        {myReservations.length === 0 ? (
          <p className="p-8 text-center text-sm text-black">
            No recent academic reservations found.
          </p>
        ) : (
          <div className="divide-y divide-slate-900/[0.06]">
            {myReservations.slice(0, 5).map((res) => {
              const space = spaces.find((s) => s.id === res.spaceId);
              return (
                <div
                  key={res.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-900/[0.02]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold text-black">
                        {space ? space.name : res.spaceId}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs text-black">
                        {res.purpose}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-xs text-black tabular-nums">
                        {res.id}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-black flex items-center gap-2 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-black" />
                      <span>
                        {res.date} · {res.startTime} – {res.endTime} ·{' '}
                        {res.attendees} attendees
                      </span>
                    </p>
                  </div>
                  <ReservationStatusBadge status={res.status} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
