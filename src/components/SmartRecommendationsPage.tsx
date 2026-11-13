import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  ALL_FACILITIES,
  BUILDINGS,
  DEFAULT_TODAY,
  SPACE_TYPES,
} from '../data/seedData';
import {
  BuildingName,
  Facility,
  RecommendationCriteria,
  Reservation,
  SpaceType,
  StudySpace,
} from '../types/unispace';
import { computeSpaceRecommendations } from '../utils/unispaceLogic';
import { FacilityIcon } from './SpaceCard';
import { PrefilledSlot } from './SpaceDetailsPage';
import { SpaceImage } from './SpaceImage';
import { OccupancyStatusBadge } from './StatusBadge';

interface SmartRecommendationsPageProps {
  spaces: StudySpace[];
  reservations: Reservation[];
  onViewSpaceDetails: (spaceId: string, prefill?: PrefilledSlot) => void;
}

export function SmartRecommendationsPage({
  spaces,
  reservations,
  onViewSpaceDetails,
}: SmartRecommendationsPageProps) {
  const [criteria, setCriteria] = useState<RecommendationCriteria>({
    date: DEFAULT_TODAY,
    startTime: '10:00',
    endTime: '12:00',
    attendees: 4,
    preferredSpaceType: 'Discussion Room',
    requiredFacilities: ['Wi-Fi', 'Whiteboard'],
    preferredBuilding: 'Any',
  });

  const [appliedCriteria, setAppliedCriteria] =
    useState<RecommendationCriteria>(criteria);

  const toggleFacility = (facility: Facility) => {
    setCriteria((prev) => {
      const exists = prev.requiredFacilities.includes(facility);
      return {
        ...prev,
        requiredFacilities: exists
          ? prev.requiredFacilities.filter((f) => f !== facility)
          : [...prev.requiredFacilities, facility],
      };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedCriteria(criteria);
  };

  const recommendations = computeSpaceRecommendations(
    spaces,
    appliedCriteria,
    reservations
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-black">
          Recommended For You
        </h2>
        <p className="mt-1 text-sm text-black">
          Pick your group size, time, and equipment to get the best matching study rooms.
        </p>
      </div>

      {/* Preference Form */}
      <section className="liquid-glass rounded-[28px] p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label
                htmlFor="rec-date"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Date
              </label>
              <input
                id="rec-date"
                type="date"
                value={criteria.date}
                onChange={(e) =>
                  setCriteria((p) => ({ ...p, date: e.target.value }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="rec-start"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Start Time
              </label>
              <input
                id="rec-start"
                type="time"
                value={criteria.startTime}
                onChange={(e) =>
                  setCriteria((p) => ({ ...p, startTime: e.target.value }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="rec-end"
                className="block text-xs font-medium text-black mb-1.5"
              >
                End Time
              </label>
              <input
                id="rec-end"
                type="time"
                value={criteria.endTime}
                onChange={(e) =>
                  setCriteria((p) => ({ ...p, endTime: e.target.value }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="rec-people"
                className="block text-xs font-medium text-black mb-1.5"
              >
                People
              </label>
              <input
                id="rec-people"
                type="number"
                min={1}
                max={30}
                value={criteria.attendees}
                onChange={(e) =>
                  setCriteria((p) => ({
                    ...p,
                    attendees: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="rec-building"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Building
              </label>
              <select
                id="rec-building"
                value={criteria.preferredBuilding}
                onChange={(e) =>
                  setCriteria((p) => ({
                    ...p,
                    preferredBuilding: e.target.value as BuildingName | 'Any',
                  }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
              >
                <option value="Any">Any Building</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-slate-900/[0.06] items-end">
            <div className="lg:col-span-3">
              <label
                htmlFor="rec-type"
                className="block text-xs font-medium text-black mb-1.5"
              >
                Space Type
              </label>
              <select
                id="rec-type"
                value={criteria.preferredSpaceType}
                onChange={(e) =>
                  setCriteria((p) => ({
                    ...p,
                    preferredSpaceType: e.target.value as SpaceType | 'Any',
                  }))
                }
                className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm"
              >
                <option value="Any">Any Space Type</option>
                {SPACE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-7">
              <span className="block text-xs font-medium text-black mb-1.5">
                Facilities
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_FACILITIES.map((facility) => {
                  const checked = criteria.requiredFacilities.includes(facility);
                  return (
                    <label
                      key={facility}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#007AFF]/12 text-[#0062CC]'
                          : 'bg-slate-900/[0.045] text-black'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFacility(facility)}
                        className="w-3.5 h-3.5 rounded accent-[#007AFF]"
                      />
                      <span>{facility}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Find Matches</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Ranked Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-black">
            Best Matches ({recommendations.length})
          </h3>
          <span className="text-xs text-black tabular-nums">
            For {appliedCriteria.attendees}{' '}
            {appliedCriteria.attendees === 1 ? 'person' : 'people'} on{' '}
            {appliedCriteria.date} ({appliedCriteria.startTime}–
            {appliedCriteria.endTime})
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="liquid-glass rounded-[28px] p-10 text-center">
            <h4 className="font-display text-base font-bold text-black">
              No spaces accommodate {appliedCriteria.attendees} people
            </h4>
            <p className="mt-1 text-sm text-black">
              Our largest active room seats 20 people. Try reducing group size or splitting across two study rooms.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <article
                key={rec.space.id}
                className="liquid-glass rounded-[28px] overflow-hidden grid grid-cols-1 md:grid-cols-12"
              >
                <div className="md:col-span-4 p-3 md:pr-0">
                  <div className="aspect-[4/3] md:h-full w-full rounded-[20px] bg-slate-200/60 overflow-hidden">
                    <SpaceImage
                      src={rec.space.imageUrl}
                      alt={rec.space.name}
                      title={rec.space.name}
                    />
                  </div>
                </div>

                <div className="md:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#007AFF] tabular-nums">
                          #{index + 1} Match · {rec.score}% Fit
                        </p>
                        <h4 className="mt-1 font-display text-lg font-bold text-black">
                          {rec.space.name}
                        </h4>
                        <p className="mt-1 text-xs text-black flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-black" />
                            {rec.space.building} · {rec.space.floor}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{rec.space.spaceType}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Users className="w-3.5 h-3.5 text-black" />
                            Capacity {rec.space.capacity} ({rec.capacityFitLabel})
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <OccupancyStatusBadge
                          status={rec.space.occupancyStatus}
                          compact
                        />
                        {rec.isAvailableForSlot ? (
                          <span className="text-xs font-medium text-[#147A40] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Free for requested slot
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-[#9A5B00] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Conflict at requested time
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 p-3.5 rounded-2xl bg-slate-900/[0.035] text-sm text-black leading-relaxed">
                      {rec.explanation}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-black">
                      <span className="font-semibold text-black">
                        Facilities:
                      </span>
                      {rec.space.facilities.map((f) => (
                        <span
                          key={f}
                          className={`inline-flex items-center gap-1 ${
                            rec.matchingFacilities.includes(f)
                              ? 'font-semibold text-[#147A40]'
                              : ''
                          }`}
                        >
                          <FacilityIcon facility={f} />
                          <span>{f}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900/[0.06] flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => onViewSpaceDetails(rec.space.id)}
                      className="px-4 py-2 rounded-full bg-slate-900/[0.05] text-sm font-medium text-black hover:bg-slate-900/[0.09] cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onViewSpaceDetails(rec.space.id, {
                          date: appliedCriteria.date,
                          startTime: appliedCriteria.startTime,
                          endTime: appliedCriteria.endTime,
                          attendees: appliedCriteria.attendees,
                        })
                      }
                      className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] cursor-pointer whitespace-nowrap"
                    >
                      Reserve Space
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
