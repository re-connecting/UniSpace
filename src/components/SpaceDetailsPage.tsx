import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { BOOKING_PURPOSES, DEFAULT_TODAY } from '../data/seedData';
import {
  BookingPurpose,
  Reservation,
  StudySpace,
  UserRole,
} from '../types/unispace';
import {
  getReservationsForSpaceOnDate,
  validateReservation,
} from '../utils/unispaceLogic';
import { FacilityIcon } from './SpaceCard';
import { SpaceImage } from './SpaceImage';
import { OccupancyStatusBadge } from './StatusBadge';

export interface PrefilledSlot {
  date?: string;
  startTime?: string;
  endTime?: string;
  attendees?: number;
}

interface SpaceDetailsPageProps {
  space: StudySpace;
  userRole: UserRole;
  reservations: Reservation[];
  prefilledSlot?: PrefilledSlot;
  onBack: () => void;
  onConfirmBooking: (payload: {
    spaceId: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
    purpose: BookingPurpose;
  }) => void;
}

export function SpaceDetailsPage({
  space,
  userRole,
  reservations,
  prefilledSlot,
  onBack,
  onConfirmBooking,
}: SpaceDetailsPageProps) {
  const [date, setDate] = useState(prefilledSlot?.date || DEFAULT_TODAY);
  const [startTime, setStartTime] = useState(prefilledSlot?.startTime || '10:00');
  const [endTime, setEndTime] = useState(prefilledSlot?.endTime || '12:00');
  const [attendees, setAttendees] = useState<string>(
    String(
      prefilledSlot?.attendees ??
        (space.capacity === 1 ? 1 : Math.min(4, space.capacity))
    )
  );
  const [purpose, setPurpose] = useState<BookingPurpose | ''>(
    userRole === 'Lecturer'
      ? space.spaceType === 'Consultation Room'
        ? 'Student Consultation'
        : 'Tutorial'
      : space.capacity === 1
      ? 'Individual Study'
      : 'Group Discussion'
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (prefilledSlot?.date) setDate(prefilledSlot.date);
    if (prefilledSlot?.startTime) setStartTime(prefilledSlot.startTime);
    if (prefilledSlot?.endTime) setEndTime(prefilledSlot.endTime);
    if (prefilledSlot?.attendees) setAttendees(String(prefilledSlot.attendees));
  }, [prefilledSlot]);

  const bookingsOnDate = date
    ? getReservationsForSpaceOnDate(space.id, date, reservations)
    : [];

  const liveCheck = validateReservation({
    space,
    date,
    startTime,
    endTime,
    attendees,
    purpose,
    reservations,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const check = validateReservation({
      space,
      date,
      startTime,
      endTime,
      attendees,
      purpose,
      reservations,
    });
    if (!check.valid) {
      setValidationErrors(check.errors);
      return;
    }
    setValidationErrors([]);
    onConfirmBooking({
      spaceId: space.id,
      date,
      startTime,
      endTime,
      attendees: Number(attendees),
      purpose: purpose as BookingPurpose,
    });
  };

  const isMaintenance = space.occupancyStatus === 'Maintenance' || !space.isActive;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/[0.05] text-sm font-semibold text-black hover:bg-slate-900/[0.09] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Study Spaces</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="liquid-glass rounded-[28px] overflow-hidden">
            <div className="p-3 pb-0">
              <div className="aspect-[16/10] w-full rounded-[20px] bg-slate-200/60 overflow-hidden">
                <SpaceImage
                  src={space.imageUrl}
                  alt={`${space.name} in ${space.building}`}
                  title={space.name}
                />
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-black">
                    {space.id} · {space.spaceType}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-black">
                    {space.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-black flex items-center gap-1.5">
                    <MapPin
                      className="w-4 h-4 text-[#007AFF] shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {space.building} · {space.floor}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="block text-[11px] font-medium text-black mb-1">
                    Current Status
                  </span>
                  <OccupancyStatusBadge status={space.occupancyStatus} />
                </div>
              </div>

              <p className="mt-4 text-sm text-black leading-relaxed">
                {space.description}
              </p>

              <div className="mt-5 pt-5 border-t border-slate-900/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-black">
                    Room Capacity
                  </p>
                  <p className="mt-1 text-sm font-semibold text-black flex items-center gap-2 tabular-nums">
                    <Users
                      className="w-4 h-4 text-[#007AFF]"
                      aria-hidden="true"
                    />
                    <span>
                      {space.capacity}{' '}
                      {space.capacity === 1 ? 'person' : 'people'}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-black">
                    Facilities
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-black">
                    {space.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="inline-flex items-center gap-1"
                      >
                        <FacilityIcon facility={facility} />
                        <span>{facility}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-black">
                  Schedule on {date || 'Selected Date'}
                </h3>
                <p className="text-xs text-black mt-0.5">
                  Operating hours are 08:00 – 22:00. Existing bookings are listed below.
                </p>
              </div>
              {!isMaintenance && (
                <span className="text-xs font-medium text-[#147A40] tabular-nums">
                  {bookingsOnDate.length === 0
                    ? 'Open all day'
                    : `${bookingsOnDate.length} booked slot${
                        bookingsOnDate.length > 1 ? 's' : ''
                      }`}
                </span>
              )}
            </div>

            {isMaintenance ? (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/[0.04] text-sm text-black">
                This space is currently under maintenance and unavailable for bookings.
              </div>
            ) : bookingsOnDate.length === 0 ? (
              <div className="mt-4 p-4 rounded-2xl bg-[#1F9D55]/10 text-sm text-[#147A40] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  No conflicting reservations on {date}. All hours (08:00 – 22:00) are open.
                </span>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-900/[0.06] rounded-2xl bg-slate-900/[0.03]">
                {bookingsOnDate.map((b) => (
                  <div
                    key={b.id}
                    className="px-4 py-3 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono font-semibold text-black tabular-nums flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C77700]" />
                      {b.startTime} – {b.endTime}
                    </span>
                    <span className="text-black">
                      Reserved ({b.purpose})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reservation Sheet */}
        <div className="lg:col-span-5">
          <div className="liquid-glass rounded-[28px] p-6 sticky top-24">
            <h3 className="font-display text-lg font-bold text-black">
              Reserve This Space
            </h3>
            <p className="mt-1 text-xs text-black">
              Choose your time window and confirm your booking.
            </p>

            {validationErrors.length > 0 && (
              <div
                role="alert"
                className="mt-4 rounded-2xl bg-[#E53935]/10 p-3.5 text-xs text-[#C62828] space-y-1"
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Please resolve the following:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {validationErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="res-date"
                  className="block text-xs font-semibold text-black mb-1.5"
                >
                  Reservation Date
                </label>
                <div className="relative">
                  <Calendar
                    className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="res-date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setValidationErrors([]);
                    }}
                    className="liquid-input w-full pl-9 pr-3 py-2.5 rounded-2xl text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="res-start"
                    className="block text-xs font-semibold text-black mb-1.5"
                  >
                    Start Time
                  </label>
                  <input
                    id="res-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setValidationErrors([]);
                    }}
                    className="liquid-input w-full px-3 py-2.5 rounded-2xl text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-end"
                    className="block text-xs font-semibold text-black mb-1.5"
                  >
                    End Time
                  </label>
                  <input
                    id="res-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setValidationErrors([]);
                    }}
                    className="liquid-input w-full px-3 py-2.5 rounded-2xl text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="res-people"
                  className="block text-xs font-semibold text-black mb-1.5"
                >
                  Number of People (Max {space.capacity})
                </label>
                <input
                  id="res-people"
                  type="number"
                  min={1}
                  value={attendees}
                  onChange={(e) => {
                    setAttendees(e.target.value);
                    setValidationErrors([]);
                  }}
                  className="liquid-input w-full px-3.5 py-2.5 rounded-2xl text-sm tabular-nums"
                />
              </div>

              <div>
                <label
                  htmlFor="res-purpose"
                  className="block text-xs font-semibold text-black mb-1.5"
                >
                  Booking Purpose
                </label>
                <select
                  id="res-purpose"
                  value={purpose}
                  onChange={(e) => {
                    setPurpose(e.target.value as BookingPurpose | '');
                    setValidationErrors([]);
                  }}
                  className="liquid-input w-full px-3.5 py-2.5 rounded-2xl text-sm"
                >
                  <option value="">Select booking purpose...</option>
                  {BOOKING_PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clean Summary */}
              <div className="rounded-2xl bg-slate-900/[0.035] p-4 space-y-2">
                <p className="text-xs font-bold text-black">
                  Summary
                </p>
                <div className="text-xs text-black space-y-1 tabular-nums">
                  <div className="flex justify-between gap-2">
                    <span>Space</span>
                    <span className="font-semibold text-black">
                      {space.name}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Location</span>
                    <span>
                      {space.building}, {space.floor}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Date & Time</span>
                    <span className="font-semibold text-black">
                      {date || '—'} · {startTime || '—'}–{endTime || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Group Size</span>
                    <span>
                      {attendees || '—'}{' '}
                      {Number(attendees) === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Purpose</span>
                    <span>{purpose || '—'}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900/[0.06] text-xs">
                  {liveCheck.valid ? (
                    <span className="text-[#147A40] font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Slot is open for confirmation
                    </span>
                  ) : (
                    <span className="text-[#C62828] font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {liveCheck.errors[0]}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_8px_20px_rgba(0,122,255,0.28)] transition-all active:scale-[0.98] cursor-pointer"
              >
                Confirm Reservation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
