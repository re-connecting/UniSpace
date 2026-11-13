import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Clock,
  Compass,
  QrCode,
  Search,
} from 'lucide-react';
import { BUILDINGS } from '../data/seedData';
import {
  BuildingName,
  Reservation,
  StudySpace,
  User,
} from '../types/unispace';
import { SpaceCard } from './SpaceCard';
import { ReservationStatusBadge } from './StatusBadge';

interface StudentDashboardProps {
  user: User;
  spaces: StudySpace[];
  reservations: Reservation[];
  onQuickSearch: (query: string, building: BuildingName | 'All') => void;
  onDiscoverSpaces: () => void;
  onOpenQrScanner: () => void;
  onViewSpaceDetails: (spaceId: string) => void;
  onViewReservations: () => void;
}

export function StudentDashboard({
  user,
  spaces,
  reservations,
  onQuickSearch,
  onDiscoverSpaces,
  onOpenQrScanner,
  onViewSpaceDetails,
  onViewReservations,
}: StudentDashboardProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingName | 'All'>(
    'All'
  );

  const activeSpaces = spaces.filter((s) => s.isActive);
  const availableSpacesCount = activeSpaces.filter(
    (s) => s.occupancyStatus === 'Available'
  ).length;

  const myUpcoming = reservations
    .filter((r) => r.userId === user.id && r.status === 'Upcoming')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const recommendedSpaces = activeSpaces
    .filter(
      (s) =>
        s.occupancyStatus !== 'Maintenance' &&
        (s.spaceType === 'Individual Desk' || s.spaceType === 'Discussion Room')
    )
    .sort((a, b) =>
      a.occupancyStatus === 'Available' && b.occupancyStatus !== 'Available'
        ? -1
        : 1
    )
    .slice(0, 3);

  const handleQuickSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onQuickSearch(searchText, selectedBuilding);
  };

  return (
    <div className="space-y-8">
      {/* Greeting & Quick Actions */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-black text-balance">
            Hi, {user.fullName}
          </h2>
          <p className="mt-1.5 text-sm text-black max-w-xl leading-relaxed">
            Find a quiet spot for solo focus or reserve a group room with your team.
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
            onClick={onDiscoverSpaces}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_8px_20px_rgba(0,122,255,0.26)] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>Discover Spaces</span>
          </button>
        </div>
      </section>

      {/* Unified Glass Summary Strip */}
      <section
        aria-label="Dashboard Summary"
        className="liquid-glass rounded-[28px] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/[0.07]"
      >
        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-black">
            Available Spaces
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-black tabular-nums">
            {availableSpacesCount}
          </p>
          <p className="mt-1 text-xs text-black tabular-nums">
            {activeSpaces.length} active spots across campus
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-black">
            Upcoming Reservations
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-[#007AFF] tabular-nums">
            {myUpcoming.length}
          </p>
          <p className="mt-1 text-xs text-black truncate">
            {myUpcoming[0]
              ? `Next: ${myUpcoming[0].date} at ${myUpcoming[0].startTime}`
              : 'No upcoming sessions'}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-black">
            Recommended for You
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-black tabular-nums">
            {recommendedSpaces.length}
          </p>
          <p className="mt-1 text-xs text-black">
            Quiet desks & collaborative study rooms
          </p>
        </div>
      </section>

      {/* Spotlight Search Pill */}
      <section className="liquid-glass rounded-[28px] p-3 sm:p-3.5">
        <form
          onSubmit={handleQuickSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
        >
          <div className="md:col-span-6 relative">
            <Search
              className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              aria-label="Search study spaces by name or facility"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search study room, whiteboard, quiet desk..."
              className="liquid-input w-full pl-10 pr-4 py-2.5 rounded-full text-sm text-black placeholder:text-black/45"
            />
          </div>
          <div className="md:col-span-4 relative">
            <Building2
              className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              aria-label="Filter by building"
              value={selectedBuilding}
              onChange={(e) =>
                setSelectedBuilding(e.target.value as BuildingName | 'All')
              }
              className="liquid-input w-full pl-10 pr-4 py-2.5 rounded-full text-sm text-black"
            >
              <option value="All">All Campus Buildings</option>
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Recommended Spaces */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-black">
              Suggested Study Spaces
            </h3>
            <p className="text-xs text-black mt-0.5">
              Popular desks and group rooms ready to book
            </p>
          </div>
          <button
            type="button"
            onClick={onDiscoverSpaces}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#007AFF] hover:underline cursor-pointer whitespace-nowrap"
          >
            <span>See all</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onViewDetails={onViewSpaceDetails}
            />
          ))}
        </div>
      </section>

      {/* Upcoming Reservations List */}
      <section className="liquid-glass rounded-[28px] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-900/[0.06] flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-black">
              Upcoming Sessions
            </h3>
            <p className="text-xs text-black mt-0.5">
              Your scheduled study times across campus
            </p>
          </div>
          <button
            type="button"
            onClick={onViewReservations}
            className="text-sm font-semibold text-[#007AFF] hover:underline cursor-pointer whitespace-nowrap"
          >
            View All
          </button>
        </div>

        {myUpcoming.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-black">
              No upcoming study sessions yet.
            </p>
            <p className="mt-1 text-xs text-black">
              Explore available desks and rooms whenever you are ready.
            </p>
            <button
              type="button"
              onClick={onDiscoverSpaces}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold cursor-pointer"
            >
              Browse Spaces
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-900/[0.06]">
            {myUpcoming.slice(0, 4).map((res) => {
              const space = spaces.find((s) => s.id === res.spaceId);
              return (
                <div
                  key={res.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-900/[0.02] transition-colors"
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
                        {space?.building}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-xs text-black tabular-nums">
                        {res.id}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-black flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-black" />
                        {res.date} · {res.startTime} – {res.endTime}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {res.attendees} {res.attendees === 1 ? 'person' : 'people'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{res.purpose}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <ReservationStatusBadge status={res.status} />
                    <button
                      type="button"
                      onClick={onViewReservations}
                      className="px-3.5 py-1.5 rounded-full bg-slate-900/[0.05] text-xs font-semibold text-black hover:bg-slate-900/[0.09] cursor-pointer whitespace-nowrap"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
