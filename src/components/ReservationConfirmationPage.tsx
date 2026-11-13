import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MapPin,
  Users,
} from 'lucide-react';
import { Reservation, StudySpace } from '../types/unispace';
import { ReservationStatusBadge } from './StatusBadge';

interface ReservationConfirmationPageProps {
  reservation: Reservation;
  space?: StudySpace;
  onViewMyReservations: () => void;
  onBackToDashboard: () => void;
}

export function ReservationConfirmationPage({
  reservation,
  space,
  onViewMyReservations,
  onBackToDashboard,
}: ReservationConfirmationPageProps) {
  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="liquid-glass rounded-[32px] p-6 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[#1F9D55]/12 text-[#1F9D55] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>

        <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-black">
          Reservation Confirmed
        </h2>
        <p className="mt-2 text-sm text-black max-w-md mx-auto">
          Your study space is booked and added to your monthly schedule. Keep your Booking ID handy when checking in.
        </p>

        <div className="mt-8 text-left rounded-[24px] bg-slate-900/[0.035] p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-900/[0.06]">
            <div>
              <span className="text-xs font-medium text-black block">
                Booking ID
              </span>
              <span className="font-mono text-lg font-bold text-black tabular-nums">
                {reservation.id}
              </span>
            </div>
            <ReservationStatusBadge status={reservation.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-black block">
                Study Space
              </span>
              <span className="font-semibold text-black mt-0.5 block">
                {space ? space.name : reservation.spaceId}
              </span>
              {space && (
                <span className="text-xs text-black flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
                  {space.building} · {space.floor}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-black block">
                Date & Time
              </span>
              <span className="font-semibold text-black mt-0.5 block tabular-nums">
                {reservation.date}
              </span>
              <span className="text-xs text-black flex items-center gap-1 mt-0.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                {reservation.startTime} – {reservation.endTime}
              </span>
            </div>

            <div>
              <span className="text-xs text-black block">
                Group Size
              </span>
              <span className="font-semibold text-black mt-0.5 flex items-center gap-1.5 tabular-nums">
                <Users className="w-4 h-4 text-[#007AFF]" />
                {reservation.attendees}{' '}
                {reservation.attendees === 1 ? 'person' : 'people'}
              </span>
            </div>

            <div>
              <span className="text-xs text-black block">
                Purpose
              </span>
              <span className="font-semibold text-black mt-0.5 block">
                {reservation.purpose}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onViewMyReservations}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] cursor-pointer whitespace-nowrap"
          >
            <CalendarCheck className="w-4 h-4" aria-hidden="true" />
            <span>View My Reservations</span>
          </button>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/[0.05] text-sm font-medium text-black hover:bg-slate-900/[0.09] cursor-pointer whitespace-nowrap"
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
