import { FormEvent, useEffect, useState } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BUILDINGS,
  SPACE_TYPES,
} from '../data/seedData';
import {
  BuildingName,
  Reservation,
  SpaceSearchFilters,
  SpaceType,
  StudySpace,
} from '../types/unispace';
import {
  filterSpaces,
  isSpaceAvailableForSlot,
  parseTimeToMinutes,
  sortSpaces,
} from '../utils/unispaceLogic';
import { SpaceCard } from './SpaceCard';

interface DiscoverSpacesPageProps {
  spaces: StudySpace[];
  reservations: Reservation[];
  filters: SpaceSearchFilters;
  onApplyFilters: (next: SpaceSearchFilters) => void;
  onResetFilters: () => void;
  onViewSpaceDetails: (spaceId: string) => void;
}

export function DiscoverSpacesPage({
  spaces,
  reservations,
  filters,
  onApplyFilters,
  onResetFilters,
  onViewSpaceDetails,
}: DiscoverSpacesPageProps) {
  const [draft, setDraft] = useState<SpaceSearchFilters>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onApplyFilters(draft);
  };

  const hasValidSlotWindow =
    Boolean(filters.date && filters.startTime && filters.endTime) &&
    parseTimeToMinutes(filters.endTime) > parseTimeToMinutes(filters.startTime);

  const filtered = sortSpaces(
    filterSpaces(spaces, filters, reservations),
    filters.sortBy
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-black">
          Discover Study Spaces
        </h2>
        <p className="mt-1 text-sm text-black">
          Filter by building, space type, room capacity, or time window to find an available room.
        </p>
      </div>

      {/* Filter Panel */}
      <section className="liquid-glass rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal
            className="w-4 h-4 text-[#007AFF]"
            aria-hidden="true"
          />
          <h3 className="font-display text-sm font-bold text-black">
            Filter Study Spaces
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="discover-search"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Keyword
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="discover-search"
                  type="text"
                  value={draft.query}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, query: e.target.value }))
                  }
                  placeholder="Room name or keyword..."
                  className="liquid-input w-full pl-9 pr-3 py-2 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="discover-building"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Building
              </label>
              <select
                id="discover-building"
                value={draft.building}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    building: e.target.value as BuildingName | 'All',
                  }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
              >
                <option value="All">All Buildings</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="discover-type"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Space Type
              </label>
              <select
                id="discover-type"
                value={draft.spaceType}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    spaceType: e.target.value as SpaceType | 'All',
                  }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
              >
                <option value="All">All Space Types</option>
                {SPACE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="discover-capacity"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Room Capacity
              </label>
              <select
                id="discover-capacity"
                value={draft.minCapacity}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    minCapacity:
                      e.target.value === 'All' ? 'All' : Number(e.target.value),
                  }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
              >
                <option value="All">Any Room Capacity</option>
                <option value="1">1+ people</option>
                <option value="4">4+ people</option>
                <option value="6">6+ people</option>
                <option value="8">8+ people</option>
                <option value="16">16+ people</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-900/[0.06]">
            <div>
              <label
                htmlFor="discover-date"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Date
              </label>
              <input
                id="discover-date"
                type="date"
                value={draft.date}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, date: e.target.value }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="discover-start"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Start Time
              </label>
              <input
                id="discover-start"
                type="time"
                value={draft.startTime}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, startTime: e.target.value }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="discover-end"
                className="block text-xs font-medium text-black mb-1.5"
              >
                End Time
              </label>
              <input
                id="discover-end"
                type="time"
                value={draft.endTime}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, endTime: e.target.value }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-900/[0.06] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/[0.05] text-sm font-medium text-black hover:bg-slate-900/[0.09] cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </section>

      {/* Results Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-black tabular-nums">
          Showing{' '}
          <strong className="text-black">
            {filtered.length}
          </strong>{' '}
          {filtered.length === 1 ? 'study space' : 'study spaces'}
          {hasValidSlotWindow && (
            <span>
              {' '}
              available on <strong>{filters.date}</strong> ({filters.startTime}{' '}
              – {filters.endTime})
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <label
            htmlFor="discover-sort"
            className="text-xs font-medium text-black whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="discover-sort"
            value={filters.sortBy}
            onChange={(e) =>
              onApplyFilters({
                ...filters,
                sortBy: e.target.value as SpaceSearchFilters['sortBy'],
              })
            }
            className="liquid-input px-3.5 py-1.5 rounded-full text-sm"
          >
            <option value="recommended">Recommended</option>
            <option value="available-first">Available First</option>
            <option value="capacity-asc">Capacity: Low to High</option>
            <option value="capacity-desc">Capacity: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="liquid-glass rounded-[28px] p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900/[0.06] text-black flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-bold text-black">
            No study spaces match your filters
          </h3>
          <p className="mt-1.5 text-sm text-black max-w-md mx-auto">
            Try clearing a filter, adjusting the room capacity, or selecting a different time window.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((space) => {
            const slotFree = hasValidSlotWindow
              ? isSpaceAvailableForSlot(
                  space,
                  filters.date,
                  filters.startTime,
                  filters.endTime,
                  reservations
                )
              : false;
            return (
              <SpaceCard
                key={space.id}
                space={space}
                onViewDetails={onViewSpaceDetails}
                slotStatusLabel={
                  hasValidSlotWindow && slotFree
                    ? `Free on ${filters.date} (${filters.startTime}–${filters.endTime})`
                    : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
