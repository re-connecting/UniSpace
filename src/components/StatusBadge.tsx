import {
  CheckCircle2,
  Clock,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';
import { AccountStatus, OccupancyStatus, ReservationStatus } from '../types/unispace';

interface OccupancyBadgeProps {
  status: OccupancyStatus;
  compact?: boolean;
}

export function OccupancyStatusBadge({ status, compact = false }: OccupancyBadgeProps) {
  const config: Record<
    OccupancyStatus,
    { label: string; classes: string; Icon: typeof CheckCircle2 }
  > = {
    Available: {
      label: 'Available',
      classes:
        'bg-[#1F9D55]/10 text-[#147A40]',
      Icon: CheckCircle2,
    },
    Occupied: {
      label: 'Occupied',
      classes:
        'bg-[#E53935]/10 text-[#C62828]',
      Icon: Users,
    },
    Reserved: {
      label: 'Reserved',
      classes:
        'bg-[#C77700]/10 text-[#9A5B00]',
      Icon: Clock,
    },
    Maintenance: {
      label: 'Maintenance',
      classes:
        'bg-slate-900/[0.06] text-black',
      Icon: Wrench,
    },
  };

  const { label, classes, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap shrink-0 ${classes} ${
        compact ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const config: Record<
    ReservationStatus,
    { classes: string; Icon: typeof CheckCircle2 }
  > = {
    Upcoming: {
      classes:
        'bg-[#007AFF]/10 text-[#0062CC]',
      Icon: Clock,
    },
    Completed: {
      classes:
        'bg-[#1F9D55]/10 text-[#147A40]',
      Icon: CheckCircle2,
    },
    Cancelled: {
      classes:
        'bg-[#E53935]/10 text-[#C62828]',
      Icon: XCircle,
    },
  };

  const { classes, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap shrink-0 ${classes}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const config: Record<AccountStatus, string> = {
    Active:
      'bg-[#1F9D55]/10 text-[#147A40]',
    Suspended:
      'bg-[#E53935]/10 text-[#C62828]',
    Pending:
      'bg-[#C77700]/10 text-[#9A5B00]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${config[status]}`}
    >
      {status}
    </span>
  );
}
