import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  QrCode,
  Search,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import {
  Reservation,
  ReservationStatus,
  StudySpace,
  User,
} from '../types/unispace';
import { buildCheckInQrData } from '../utils/unispaceLogic';
import { ConfirmDialog } from './ConfirmDialog';
import { ReservationStatusBadge } from './StatusBadge';

interface MyReservationsPageProps {
  user: User;
  reservations: Reservation[];
  spaces: StudySpace[];
  onCancelReservation: (reservationId: string) => void;
  onCheckInReservation: (reservationId: string) => void;
  onDiscoverSpaces: () => void;
}

export function MyReservationsPage({
  user,
  reservations,
  spaces,
  onCancelReservation,
  onCheckInReservation,
  onDiscoverSpaces,
}: MyReservationsPageProps) {
  const [activeTab, setActiveTab] = useState<ReservationStatus>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailReservation, setDetailReservation] =
    useState<Reservation | null>(null);
  const [qrReservationId, setQrReservationId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  const qrReservation = qrReservationId
    ? reservations.find((r) => r.id === qrReservationId) ?? null
    : null;
  const qrSpace = qrReservation
    ? spaces.find((s) => s.id === qrReservation.spaceId)
    : undefined;
  const qrData = qrReservation ? buildCheckInQrData(qrReservation) : null;

  useEffect(() => {
    if (!qrData) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(qrData.qrPayload, {
      width: 220,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [qrData?.qrPayload]);

  const userReservations = reservations.filter((r) => r.userId === user.id);

  const countByStatus = {
    Upcoming: userReservations.filter((r) => r.status === 'Upcoming').length,
    Completed: userReservations.filter((r) => r.status === 'Completed').length,
    Cancelled: userReservations.filter((r) => r.status === 'Cancelled').length,
  };

  const filtered = userReservations
    .filter((r) => r.status === activeTab)
    .filter((r) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const space = spaces.find((s) => s.id === r.spaceId);
      return (
        r.id.toLowerCase().includes(q) ||
        (space?.name.toLowerCase().includes(q) ?? false) ||
        (space?.building.toLowerCase().includes(q) ?? false)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime));

  const detailSpace = detailReservation
    ? spaces.find((s) => s.id === detailReservation.spaceId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-black">
            My Reservations
          </h2>
          <p className="mt-1 text-sm text-black">
            View and manage your upcoming, completed, and cancelled campus study space bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={onDiscoverSpaces}
          className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_6px_16px_rgba(0,122,255,0.24)] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          Book Space
        </button>
      </div>

      {/* List View & Tabs */}
      <div className="liquid-glass rounded-[26px] p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div
            role="tablist"
            aria-label="Reservation status tabs"
            className="inline-flex p-1 bg-slate-900/[0.05] rounded-full self-start"
          >
            {(
              ['Upcoming', 'Completed', 'Cancelled'] as ReservationStatus[]
            ).map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap tabular-nums ${
                    isSelected
                      ? 'bg-white text-black shadow-xs'
                      : 'text-black hover:text-black'
                  }`}
                >
                  {tab} ({countByStatus[tab]})
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              aria-label="Search by booking ID or space name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Booking ID or space..."
              className="liquid-input w-full sm:w-56 pl-9 pr-3 py-2 rounded-full text-sm"
            />
          </div>
        </div>
      </div>

          {filtered.length === 0 ? (
            <div className="liquid-glass rounded-[28px] p-12 text-center">
              <h3 className="font-display text-lg font-bold text-black">
                No {activeTab.toLowerCase()} reservations found
              </h3>
              <p className="mt-1.5 text-sm text-black max-w-md mx-auto">
                {searchQuery
                  ? 'No bookings match your search criteria. Try clearing the search box.'
                  : `You currently have no ${activeTab.toLowerCase()} study space reservations.`}
              </p>
              <button
                type="button"
                onClick={onDiscoverSpaces}
                className="mt-5 px-5 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold cursor-pointer"
              >
                Discover Study Spaces
              </button>
            </div>
          ) : (
            <div className="liquid-glass rounded-[28px] divide-y divide-slate-900/[0.06] overflow-hidden">
              {filtered.map((res) => {
                const space = spaces.find((s) => s.id === res.spaceId);
                return (
                  <div
                    key={res.id}
                    className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-slate-900/[0.02]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-display text-base font-bold text-black">
                          {space ? space.name : res.spaceId}
                        </span>
                        <ReservationStatusBadge status={res.status} />
                        {res.checkedInAt && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1F9D55]/12 text-[#147A40] text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>Checked In</span>
                          </span>
                        )}
                        <span className="font-mono text-xs text-black tabular-nums">
                          {res.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
                          {space
                            ? `${space.building} · ${space.floor}`
                            : 'Campus'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                          {res.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                          {res.startTime} – {res.endTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#007AFF]" />
                          {res.attendees}{' '}
                          {res.attendees === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {res.status === 'Upcoming' && (
                        <button
                          type="button"
                          onClick={() => setQrReservationId(res.id)}
                          aria-label={`Generate Check-in QR for booking ${res.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0066D6] shadow-[0_4px_12px_rgba(0,122,255,0.24)] cursor-pointer whitespace-nowrap"
                        >
                          <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            {res.checkedInAt
                              ? 'View Check-in QR'
                              : 'Generate Check-in QR'}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDetailReservation(res)}
                        aria-label={`View details for booking ${res.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/[0.05] text-xs font-semibold text-black hover:bg-slate-900/[0.09] cursor-pointer whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>View Details</span>
                      </button>

                      {res.status === 'Upcoming' && (
                        <button
                          type="button"
                          onClick={() => setPendingCancelId(res.id)}
                          aria-label={`Cancel reservation ${res.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E53935]/10 text-xs font-semibold text-[#C62828] hover:bg-[#E53935]/18 cursor-pointer whitespace-nowrap"
                        >
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Cancel Reservation</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

      {/* Details Modal */}
      {detailReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="res-detail-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-md w-full p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-black">
                  {detailReservation.id}
                </p>
                <h3
                  id="res-detail-title"
                  className="font-display text-lg font-bold text-black mt-0.5"
                >
                  {detailSpace ? detailSpace.name : detailReservation.spaceId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailReservation(null)}
                aria-label="Close reservation details"
                className="p-1.5 rounded-full text-black hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm border-t border-slate-900/[0.06] pt-4">
              <div className="flex justify-between">
                <span className="text-black">Status</span>
                <ReservationStatusBadge status={detailReservation.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-black">
                  Building & Floor
                </span>
                <span className="font-medium text-black">
                  {detailSpace
                    ? `${detailSpace.building}, ${detailSpace.floor}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-black">Date</span>
                <span className="font-medium text-black">
                  {detailReservation.date}
                </span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-black">
                  Time Slot
                </span>
                <span className="font-medium text-black">
                  {detailReservation.startTime} – {detailReservation.endTime}
                </span>
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-black">
                  Group Size
                </span>
                <span className="font-medium text-black">
                  {detailReservation.attendees} people
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">
                  Booking Purpose
                </span>
                <span className="font-medium text-black">
                  {detailReservation.purpose}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {detailReservation.status === 'Upcoming' && (
                <button
                  type="button"
                  onClick={() => {
                    const id = detailReservation.id;
                    setDetailReservation(null);
                    setPendingCancelId(id);
                  }}
                  className="px-4 py-2 rounded-full bg-[#E53935]/10 text-xs font-semibold text-[#C62828] hover:bg-[#E53935]/18 cursor-pointer"
                >
                  Cancel Booking
                </button>
              )}
              <button
                type="button"
                onClick={() => setDetailReservation(null)}
                className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Check-in QR Modal */}
      {qrReservation && qrData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-checkin-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-md w-full p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-black">
                  {qrReservation.id}
                </p>
                <h3
                  id="qr-checkin-title"
                  className="font-display text-lg font-bold text-black mt-0.5"
                >
                  Room Check-in QR
                </h3>
                <p className="text-xs text-black mt-0.5">
                  {qrSpace ? `${qrSpace.name} · ${qrSpace.building}` : qrReservation.spaceId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQrReservationId(null)}
                aria-label="Close check-in QR modal"
                className="p-1.5 rounded-full text-black hover:bg-slate-900/[0.06] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center text-center">
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Check-in QR code for booking ${qrReservation.id}`}
                    className="w-48 h-48 block"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-black">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="mt-3 px-3.5 py-1.5 rounded-full bg-slate-900/[0.05] text-xs font-mono font-semibold text-black tabular-nums">
                Check-in Code: {qrData.checkInCode}
              </div>

              <p className="mt-3 text-xs text-black leading-relaxed max-w-xs">
                Scan this QR pass at the room door kiosk on{' '}
                <strong>{qrReservation.date}</strong> ({qrReservation.startTime} –{' '}
                {qrReservation.endTime}) when you arrive.
              </p>

              {qrReservation.checkedInAt && (
                <div className="mt-4 w-full px-4 py-2.5 rounded-2xl bg-[#1F9D55]/12 text-[#147A40] text-xs font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Checked into room at {qrReservation.checkedInAt}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {!qrReservation.checkedInAt && (
                <button
                  type="button"
                  onClick={() => onCheckInReservation(qrReservation.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1F9D55] text-white text-xs font-semibold hover:bg-[#198748] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Check In Now</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setQrReservationId(null)}
                className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0066D6] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingCancelId)}
        title="Cancel Study Space Reservation?"
        description={`Are you sure you want to cancel booking ${pendingCancelId}? This time slot will immediately be released for other campus users.`}
        confirmLabel="Yes, Cancel Reservation"
        cancelLabel="Keep Reservation"
        tone="danger"
        onCancel={() => setPendingCancelId(null)}
        onConfirm={() => {
          if (pendingCancelId) {
            onCancelReservation(pendingCancelId);
            setPendingCancelId(null);
          }
        }}
      />
    </div>
  );
}
