import {
  ArrowUpRight,
  PenLine,
  PlugZap,
  Presentation,
  Users,
  Wifi,
} from 'lucide-react';
import { Facility, StudySpace } from '../types/unispace';
import { SpaceImage } from './SpaceImage';
import { OccupancyStatusBadge } from './StatusBadge';

export function FacilityIcon({ facility }: { facility: Facility }) {
  switch (facility) {
    case 'Wi-Fi':
      return (
        <Wifi
          className="w-3.5 h-3.5 text-[#007AFF]"
          aria-hidden="true"
        />
      );
    case 'Power Outlets':
      return (
        <PlugZap
          className="w-3.5 h-3.5 text-[#007AFF]"
          aria-hidden="true"
        />
      );
    case 'Whiteboard':
      return (
        <PenLine
          className="w-3.5 h-3.5 text-[#1F9D55]"
          aria-hidden="true"
        />
      );
    case 'Projector':
      return (
        <Presentation
          className="w-3.5 h-3.5 text-[#C77700]"
          aria-hidden="true"
        />
      );
  }
}

interface SpaceCardProps {
  space: StudySpace;
  onViewDetails: (spaceId: string) => void;
  slotStatusLabel?: string;
}

export function SpaceCard({
  space,
  onViewDetails,
  slotStatusLabel,
}: SpaceCardProps) {
  return (
    <article className="liquid-glass rounded-[26px] overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5">
      <div className="p-2.5 pb-0">
        <div className="aspect-[16/10] w-full rounded-[18px] bg-slate-200/60 overflow-hidden">
          <SpaceImage
            src={space.imageUrl}
            alt={`${space.name} in ${space.building}`}
            title={space.name}
          />
        </div>
      </div>

      <div className="p-5 pt-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-black leading-snug truncate">
              {space.name}
            </h3>
            <p className="mt-1 text-xs text-black flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>{space.building}</span>
              <span aria-hidden="true">·</span>
              <span>{space.floor}</span>
              <span aria-hidden="true">·</span>
              <span>{space.spaceType}</span>
            </p>
          </div>
          <OccupancyStatusBadge status={space.occupancyStatus} compact />
        </div>

        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-black tabular-nums">
          <Users
            className="w-3.5 h-3.5 text-[#007AFF] shrink-0"
            aria-hidden="true"
          />
          <span>
            Room Capacity: {space.capacity}{' '}
            {space.capacity === 1 ? 'person' : 'people'}
          </span>
        </div>

        {slotStatusLabel && (
          <p className="mt-1.5 text-xs font-medium text-[#147A40]">
            {slotStatusLabel}
          </p>
        )}

        <div className="mt-3.5 pt-3 border-t border-slate-900/[0.06] flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-black">
          {space.facilities.map((facility) => (
            <span key={facility} className="inline-flex items-center gap-1">
              <FacilityIcon facility={facility} />
              <span>{facility}</span>
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => onViewDetails(space.id)}
            aria-label={`View details for ${space.name}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-sm font-semibold hover:bg-[#007AFF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007AFF] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <span>Open & Reserve</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
