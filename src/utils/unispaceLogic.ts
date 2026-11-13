import {
  BookingPurpose,
  BuildingName,
  Facility,
  PageId,
  RecommendationCriteria,
  Reservation,
  SpaceRecommendation,
  SpaceSearchFilters,
  StudySpace,
  User,
  UserRole,
} from '../types/unispace';

/**
 * Converts a "HH:mm" string into minutes since midnight. Returns NaN if invalid.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return NaN;
  const [hh, mm] = timeStr.split(':').map(Number);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return NaN;
  return hh * 60 + mm;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

/**
 * Checks if two time intervals [startA, endA) and [startB, endB) overlap.
 */
export function intervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);
  if ([sA, eA, sB, eB].some(Number.isNaN)) return false;
  return sA < eB && sB < eA;
}

export function getReservationsForSpaceOnDate(
  spaceId: string,
  date: string,
  reservations: Reservation[]
): Reservation[] {
  return reservations
    .filter(
      (r) => r.spaceId === spaceId && r.date === date && r.status === 'Upcoming'
    )
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
}

export function hasTimeConflict(
  spaceId: string,
  date: string,
  startTime: string,
  endTime: string,
  reservations: Reservation[],
  ignoreReservationId?: string
): Reservation | undefined {
  return reservations.find(
    (r) =>
      r.id !== ignoreReservationId &&
      r.spaceId === spaceId &&
      r.date === date &&
      r.status === 'Upcoming' &&
      intervalsOverlap(startTime, endTime, r.startTime, r.endTime)
  );
}

/**
 * Future booking availability for a specific date/time window.
 * Distinct from live physical occupancyStatus, except when space is under Maintenance or inactive.
 */
export function isSpaceAvailableForSlot(
  space: StudySpace,
  date: string,
  startTime: string,
  endTime: string,
  reservations: Reservation[]
): boolean {
  if (!space.isActive || space.occupancyStatus === 'Maintenance') {
    return false;
  }
  if (!date || !startTime || !endTime) {
    return true;
  }
  const startM = parseTimeToMinutes(startTime);
  const endM = parseTimeToMinutes(endTime);
  if (Number.isNaN(startM) || Number.isNaN(endM) || endM <= startM) {
    return true;
  }
  return !hasTimeConflict(space.id, date, startTime, endTime, reservations);
}

export interface ReservationValidationInput {
  space: StudySpace;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number | string;
  purpose: BookingPurpose | '';
  reservations: Reservation[];
}

export interface ReservationValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateReservation(
  input: ReservationValidationInput
): ReservationValidationResult {
  const errors: string[] = [];
  const { space, date, startTime, endTime, attendees, purpose, reservations } = input;

  if (!space.isActive) {
    errors.push('This study space is currently deactivated and cannot be reserved.');
  }

  if (space.occupancyStatus === 'Maintenance') {
    errors.push(
      'This study space is currently under maintenance and cannot be reserved.'
    );
  }

  if (!date.trim()) {
    errors.push('Please select a reservation date.');
  }
  if (!startTime.trim()) {
    errors.push('Please select a start time.');
  }
  if (!endTime.trim()) {
    errors.push('Please select an end time.');
  }
  if (!purpose) {
    errors.push('Please select a booking purpose.');
  }

  const parsedAttendees =
    typeof attendees === 'number' ? attendees : Number(attendees);
  if (!attendees || Number.isNaN(parsedAttendees) || parsedAttendees < 1) {
    errors.push('Please enter a valid number of people (at least 1).');
  } else if (parsedAttendees > space.capacity) {
    errors.push(
      `Group size (${parsedAttendees}) exceeds the room capacity of ${space.capacity}.`
    );
  }

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (startTime && endTime && !Number.isNaN(startMin) && !Number.isNaN(endMin)) {
    if (endMin <= startMin) {
      errors.push('End time must be later than start time.');
    }
  }

  if (
    date &&
    startTime &&
    endTime &&
    !Number.isNaN(startMin) &&
    !Number.isNaN(endMin) &&
    endMin > startMin
  ) {
    const conflict = hasTimeConflict(
      space.id,
      date,
      startTime,
      endTime,
      reservations
    );
    if (conflict) {
      errors.push(
        `This space is already reserved on ${date} from ${conflict.startTime} to ${conflict.endTime}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function filterSpaces(
  spaces: StudySpace[],
  filters: SpaceSearchFilters,
  reservations: Reservation[]
): StudySpace[] {
  const q = filters.query.trim().toLowerCase();

  return spaces.filter((space) => {
    if (!space.isActive) return false;

    if (q) {
      const haystack =
        `${space.name} ${space.building} ${space.floor} ${space.spaceType} ${space.facilities.join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.building !== 'All' && space.building !== filters.building) {
      return false;
    }

    if (filters.spaceType !== 'All' && space.spaceType !== filters.spaceType) {
      return false;
    }

    if (
      filters.minCapacity !== 'All' &&
      space.capacity < Number(filters.minCapacity)
    ) {
      return false;
    }

    if (filters.facilities.length > 0) {
      const hasAll = filters.facilities.every((f) =>
        space.facilities.includes(f)
      );
      if (!hasAll) return false;
    }

    if (filters.date && filters.startTime && filters.endTime) {
      const startM = parseTimeToMinutes(filters.startTime);
      const endM = parseTimeToMinutes(filters.endTime);
      if (!Number.isNaN(startM) && !Number.isNaN(endM) && endM > startM) {
        if (
          !isSpaceAvailableForSlot(
            space,
            filters.date,
            filters.startTime,
            filters.endTime,
            reservations
          )
        ) {
          return false;
        }
      }
    }

    return true;
  });
}

export function sortSpaces(
  spaces: StudySpace[],
  sortBy: SpaceSearchFilters['sortBy']
): StudySpace[] {
  const list = [...spaces];
  const occupancyOrder: Record<StudySpace['occupancyStatus'], number> = {
    Available: 0,
    Reserved: 1,
    Occupied: 2,
    Maintenance: 3,
  };

  switch (sortBy) {
    case 'available-first':
      return list.sort(
        (a, b) =>
          occupancyOrder[a.occupancyStatus] - occupancyOrder[b.occupancyStatus] ||
          a.name.localeCompare(b.name)
      );
    case 'capacity-asc':
      return list.sort((a, b) => a.capacity - b.capacity);
    case 'capacity-desc':
      return list.sort((a, b) => b.capacity - a.capacity);
    case 'recommended':
    default:
      return list.sort((a, b) => {
        const scoreA =
          (a.occupancyStatus === 'Available' ? 20 : 0) +
          a.facilities.length * 2;
        const scoreB =
          (b.occupancyStatus === 'Available' ? 20 : 0) +
          b.facilities.length * 2;
        return scoreB - scoreA || a.name.localeCompare(b.name);
      });
  }
}

/**
 * Explainable rule-based recommendation engine.
 * Scores active, non-maintenance spaces based on time slot availability, capacity suitability,
 * facility coverage, preferred space type, and preferred building.
 */
export function computeSpaceRecommendations(
  spaces: StudySpace[],
  criteria: RecommendationCriteria,
  reservations: Reservation[]
): SpaceRecommendation[] {
  const candidates = spaces.filter(
    (s) => s.isActive && s.occupancyStatus !== 'Maintenance'
  );

  const scored: SpaceRecommendation[] = candidates
    .filter((s) => s.capacity >= Math.max(1, criteria.attendees))
    .map((space) => {
      let score = 0;

      // 1. Time slot availability (35 pts)
      const availableForSlot = isSpaceAvailableForSlot(
        space,
        criteria.date,
        criteria.startTime,
        criteria.endTime,
        reservations
      );
      if (availableForSlot) {
        score += 35;
      }

      // 2. Facility match (30 pts)
      const required = criteria.requiredFacilities;
      const matchingFacilities = required.filter((f) =>
        space.facilities.includes(f)
      );
      const missingFacilities = required.filter(
        (f) => !space.facilities.includes(f)
      );
      if (required.length === 0) {
        score += 25 + Math.min(5, space.facilities.length);
      } else {
        score += Math.round((matchingFacilities.length / required.length) * 30);
      }

      // 3. Capacity suitability (20 pts - penalize severe over-sizing so 1-person doesn't get 20-seat hall first)
      const ratio = criteria.attendees / space.capacity;
      let capacityFitLabel = 'Good fit';
      if (ratio >= 0.6) {
        score += 20;
        capacityFitLabel = 'Ideal capacity fit';
      } else if (ratio >= 0.35) {
        score += 14;
        capacityFitLabel = 'Comfortable room size';
      } else {
        score += 7;
        capacityFitLabel = 'Larger than required';
      }

      // 4. Space type match (10 pts)
      if (
        criteria.preferredSpaceType === 'Any' ||
        space.spaceType === criteria.preferredSpaceType
      ) {
        score += 10;
      }

      // 5. Building preference (5 pts)
      if (
        criteria.preferredBuilding === 'Any' ||
        space.building === criteria.preferredBuilding
      ) {
        score += 5;
      }

      // Build human-readable, explainable rationale
      const peopleText =
        criteria.attendees === 1 ? '1 person' : `${criteria.attendees} people`;
      const facilityListText =
        matchingFacilities.length > 0
          ? ` and provides ${formatFacilityList(matchingFacilities)}`
          : '';
      const buildingNote =
        criteria.preferredBuilding !== 'Any' &&
        space.building === criteria.preferredBuilding
          ? ` in ${space.building}`
          : '';

      const explanation = availableForSlot
        ? `Recommended because this space is available at your selected time${buildingNote}, supports ${peopleText} (capacity ${space.capacity})${facilityListText}.`
        : `Unavailable at your selected time due to an existing reservation, though this space${buildingNote ? ` in ${space.building}` : ''} supports ${peopleText} (capacity ${space.capacity})${facilityListText}.`;

      return {
        space,
        score: Math.min(100, score),
        isAvailableForSlot: availableForSlot,
        matchingFacilities,
        missingFacilities,
        capacityFitLabel,
        explanation,
      };
    });

  return scored.sort((a, b) => {
    if (a.isAvailableForSlot !== b.isAvailableForSlot) {
      return a.isAvailableForSlot ? -1 : 1;
    }
    return b.score - a.score || a.space.capacity - b.space.capacity;
  });
}

function formatFacilityList(facilities: Facility[]): string {
  if (facilities.length === 1) return facilities[0];
  if (facilities.length === 2) return `${facilities[0]} and ${facilities[1]}`;
  return `${facilities.slice(0, -1).join(', ')}, and ${facilities[facilities.length - 1]}`;
}

export function canAccessPage(role: UserRole, page: PageId): boolean {
  if (page === 'login' || page === 'profile' || page === 'settings') return true;
  if (role === 'Administrator') {
    return [
      'admin-dashboard',
      'manage-spaces',
      'manage-reservations',
      'manage-users',
      'profile',
      'settings',
    ].includes(page);
  }
  if (role === 'Student') {
    return [
      'student-dashboard',
      'discover-spaces',
      'space-details',
      'reservation-confirmation',
      'my-reservations',
      'smart-recommendations',
      'profile',
      'settings',
    ].includes(page);
  }
  // Lecturer
  return [
    'lecturer-dashboard',
    'discover-spaces',
    'space-details',
    'reservation-confirmation',
    'my-reservations',
    'smart-recommendations',
    'profile',
    'settings',
  ].includes(page);
}

export function getHomePageForRole(role: UserRole): PageId {
  switch (role) {
    case 'Student':
      return 'student-dashboard';
    case 'Lecturer':
      return 'lecturer-dashboard';
    case 'Administrator':
      return 'admin-dashboard';
  }
}

export interface AdminAnalyticsSummary {
  totalUsers: number;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  reservedSpaces: number;
  maintenanceSpaces: number;
  totalReservations: number;
  popularSpaces: { name: string; count: number }[];
  bySpaceType: { type: string; count: number }[];
  trendLabels: string[];
  trendCounts: number[];
}

export function getAdminAnalyticsData(
  users: User[],
  spaces: StudySpace[],
  reservations: Reservation[]
): AdminAnalyticsSummary {
  const activeSpaces = spaces.filter((s) => s.isActive);
  const availableSpaces = activeSpaces.filter(
    (s) => s.occupancyStatus === 'Available'
  ).length;
  const occupiedSpaces = activeSpaces.filter(
    (s) => s.occupancyStatus === 'Occupied'
  ).length;
  const reservedSpaces = activeSpaces.filter(
    (s) => s.occupancyStatus === 'Reserved'
  ).length;
  const maintenanceSpaces = activeSpaces.filter(
    (s) => s.occupancyStatus === 'Maintenance'
  ).length;

  const countsBySpace: Record<string, number> = {};
  const countsByType: Record<string, number> = {
    'Individual Desk': 0,
    'Discussion Room': 0,
    'Tutorial Room': 0,
    'Consultation Room': 0,
    'Lab Room': 0,
  };

  for (const res of reservations) {
    if (res.status === 'Cancelled') continue;
    const sp = spaces.find((s) => s.id === res.spaceId);
    if (sp) {
      countsBySpace[sp.name] = (countsBySpace[sp.name] || 0) + 1;
      countsByType[sp.spaceType] = (countsByType[sp.spaceType] || 0) + 1;
    }
  }

  const popularSpaces = Object.entries(countsBySpace)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const bySpaceType = Object.entries(countsByType).map(([type, count]) => ({
    type,
    count,
  }));

  // 7-day trend buckets centered on Nov 8–Nov 14, combining real reservation dates + baseline campus pattern
  const dateBuckets = [
    '2026-11-08',
    '2026-11-09',
    '2026-11-10',
    '2026-11-11',
    '2026-11-12',
    '2026-11-13',
    '2026-11-14',
  ];
  const trendLabels = ['Nov 8', 'Nov 9', 'Nov 10', 'Nov 11', 'Nov 12', 'Nov 13', 'Nov 14'];
  const baseline = [6, 9, 11, 10, 14, 12, 8];
  const trendCounts = dateBuckets.map((d, idx) => {
    const liveCount = reservations.filter(
      (r) => r.date === d && r.status !== 'Cancelled'
    ).length;
    return baseline[idx] + liveCount;
  });

  return {
    totalUsers: users.length,
    totalSpaces: activeSpaces.length,
    availableSpaces,
    occupiedSpaces,
    reservedSpaces,
    maintenanceSpaces,
    totalReservations: reservations.length,
    popularSpaces,
    bySpaceType,
    trendLabels,
    trendCounts,
  };
}

export function generateBookingId(existingCount: number): string {
  const num = 111 + existingCount;
  return `RES-2026-${num}`;
}

export interface CalendarDayCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  inCurrentMonth: boolean;
}

/**
 * Builds a Monday-first calendar grid (35 or 42 cells) for the given year and 0-based monthIndex.
 */
export function getMonthGridDays(
  year: number,
  monthIndex: number
): CalendarDayCell[] {
  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));
  // Convert JS Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startOffset = (firstOfMonth.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const totalCells = startOffset + daysInMonth > 35 ? 42 : 35;

  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(Date.UTC(year, monthIndex, 1 - startOffset + i));
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    cells.push({
      dateStr: `${yyyy}-${mm}-${dd}`,
      dayNumber: d.getUTCDate(),
      inCurrentMonth: d.getUTCMonth() === monthIndex && d.getUTCFullYear() === year,
    });
  }
  return cells;
}

export function groupReservationsByDate(
  reservations: Reservation[]
): Record<string, Reservation[]> {
  const grouped: Record<string, Reservation[]> = {};
  for (const r of reservations) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
  }
  return grouped;
}

export interface CheckInQrData {
  bookingId: string;
  spaceId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  checkInCode: string;
  qrPayload: string;
}

/**
 * Generates a deterministic check-in code and JSON payload for room arrival QR codes.
 */
export function buildCheckInQrData(reservation: Reservation): CheckInQrData {
  const raw = `${reservation.id}-${reservation.spaceId}-${reservation.date}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  const checkInCode = `UNI-${hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`;
  const qrPayload = JSON.stringify({
    system: 'UniSpace',
    action: 'room-checkin',
    bookingId: reservation.id,
    spaceId: reservation.spaceId,
    userId: reservation.userId,
    date: reservation.date,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    code: checkInCode,
  });

  return {
    bookingId: reservation.id,
    spaceId: reservation.spaceId,
    userId: reservation.userId,
    date: reservation.date,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    checkInCode,
    qrPayload,
  };
}

/**
 * Generates the QR payload printed on a study room's wall sticker.
 */
export function buildRoomWallQrPayload(spaceId: string): string {
  return `UNISPACE:ROOM:${spaceId}`;
}

/**
 * Parses a scanned wall QR payload (prefix, JSON, URL query, ID, or name)
 * and resolves the matching active StudySpace.
 */
export function parseRoomWallQrPayload(
  rawText: string,
  spaces: StudySpace[]
): StudySpace | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  let candidate: string | null = null;

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { spaceId?: unknown };
      if (typeof parsed.spaceId === 'string' && parsed.spaceId.trim()) {
        candidate = parsed.spaceId.trim();
      }
    } catch {
      // Ignore malformed JSON and fall through
    }
  }

  if (!candidate && /^UNISPACE:ROOM:/i.test(trimmed)) {
    candidate = trimmed.replace(/^UNISPACE:ROOM:/i, '').trim();
  }

  if (!candidate && (trimmed.includes('?') || /^https?:\/\//i.test(trimmed))) {
    try {
      const url = /^https?:\/\//i.test(trimmed)
        ? new URL(trimmed)
        : new URL(trimmed, 'https://unispace.local');
      candidate =
        url.searchParams.get('room') || url.searchParams.get('spaceId');
    } catch {
      // Ignore invalid URL
    }
  }

  const lookup = (candidate || trimmed).toLowerCase();
  return (
    spaces.find(
      (s) =>
        s.isActive &&
        (s.id.toLowerCase() === lookup || s.name.toLowerCase() === lookup)
    ) ?? null
  );
}

