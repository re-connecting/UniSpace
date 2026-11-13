import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCheckInQrData,
  buildRoomWallQrPayload,
  canAccessPage,
  computeSpaceRecommendations,
  filterSpaces,
  getAdminAnalyticsData,
  getMonthGridDays,
  groupReservationsByDate,
  hasTimeConflict,
  isSpaceAvailableForSlot,
  parseRoomWallQrPayload,
  sortSpaces,
  validateReservation,
} from './unispaceLogic';
import {
  INITIAL_RESERVATIONS,
  INITIAL_SPACES,
  INITIAL_USERS,
} from '../data/seedData';

test('hasTimeConflict detects overlapping upcoming reservations on same date', () => {
  // RES-2026-101 is SPC-003 on 2026-11-12 from 14:00 to 16:00
  const conflict = hasTimeConflict(
    'SPC-003',
    '2026-11-12',
    '15:00',
    '17:00',
    INITIAL_RESERVATIONS
  );
  assert.ok(conflict);
  assert.equal(conflict.id, 'RES-2026-101');

  // Adjacent non-overlapping slot 16:00 - 17:00 should be free
  const adjacent = hasTimeConflict(
    'SPC-003',
    '2026-11-12',
    '16:00',
    '17:00',
    INITIAL_RESERVATIONS
  );
  assert.equal(adjacent, undefined);
});

test('validateReservation rejects invalid time, capacity overflow, conflicts, and maintenance', () => {
  const groupRoom = INITIAL_SPACES.find((s) => s.id === 'SPC-003')!;
  const maintenanceRoom = INITIAL_SPACES.find((s) => s.id === 'SPC-008')!;

  // End time <= start time
  const badTime = validateReservation({
    space: groupRoom,
    date: '2026-11-12',
    startTime: '12:00',
    endTime: '11:00',
    attendees: 4,
    purpose: 'Group Discussion',
    reservations: INITIAL_RESERVATIONS,
  });
  assert.equal(badTime.valid, false);
  assert.ok(badTime.errors.some((e) => e.includes('End time must be later')));

  // Capacity exceeded
  const overCap = validateReservation({
    space: groupRoom,
    date: '2026-11-12',
    startTime: '09:00',
    endTime: '11:00',
    attendees: 10,
    purpose: 'Group Discussion',
    reservations: INITIAL_RESERVATIONS,
  });
  assert.equal(overCap.valid, false);
  assert.ok(overCap.errors.some((e) => e.includes('exceeds the room capacity')));

  // Conflict
  const conflicted = validateReservation({
    space: groupRoom,
    date: '2026-11-12',
    startTime: '14:30',
    endTime: '15:30',
    attendees: 4,
    purpose: 'Group Discussion',
    reservations: INITIAL_RESERVATIONS,
  });
  assert.equal(conflicted.valid, false);
  assert.ok(conflicted.errors.some((e) => e.includes('already reserved')));

  // Maintenance
  const maint = validateReservation({
    space: maintenanceRoom,
    date: '2026-11-15',
    startTime: '10:00',
    endTime: '11:00',
    attendees: 8,
    purpose: 'Tutorial',
    reservations: INITIAL_RESERVATIONS,
  });
  assert.equal(maint.valid, false);
  assert.ok(maint.errors.some((e) => e.includes('under maintenance')));

  // Valid booking
  const valid = validateReservation({
    space: groupRoom,
    date: '2026-11-15',
    startTime: '10:00',
    endTime: '12:00',
    attendees: 4,
    purpose: 'Group Discussion',
    reservations: INITIAL_RESERVATIONS,
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('computeSpaceRecommendations ranks best-fitting spaces with explainable reasons', () => {
  const recs = computeSpaceRecommendations(
    INITIAL_SPACES,
    {
      date: '2026-11-15',
      startTime: '10:00',
      endTime: '12:00',
      attendees: 4,
      preferredSpaceType: 'Discussion Room',
      requiredFacilities: ['Wi-Fi', 'Whiteboard'],
      preferredBuilding: 'Block E',
    },
    INITIAL_RESERVATIONS
  );

  assert.ok(recs.length > 0);
  // E-03-04 (capacity 4, Block E, Discussion Room, Wi-Fi + Whiteboard) should be #1
  assert.equal(recs[0].space.name, 'E-03-04');
  assert.equal(recs[0].score, 100);
  assert.ok(recs[0].explanation.includes('Recommended because'));
  assert.ok(recs[0].explanation.includes('4 people'));
  assert.ok(recs[0].explanation.includes('Wi-Fi and Whiteboard'));
});

test('filterSpaces and sortSpaces handle building, capacity, facilities, and availability', () => {
  const filtered = filterSpaces(
    INITIAL_SPACES,
    {
      query: '',
      building: 'Block B',
      spaceType: 'All',
      minCapacity: 4,
      facilities: ['Whiteboard'],
      date: '',
      startTime: '',
      endTime: '',
      sortBy: 'recommended',
    },
    INITIAL_RESERVATIONS
  );

  assert.equal(filtered.length, 2);
  assert.ok(filtered.some((s) => s.name === 'B-09-03'));

  const sortedAsc = sortSpaces(INITIAL_SPACES, 'capacity-asc');
  assert.ok(sortedAsc[0].capacity <= sortedAsc[sortedAsc.length - 1].capacity);
});

test('isSpaceAvailableForSlot distinguishes live occupancy from future slot availability', () => {
  // Discussion Room 02 is live 'Reserved' right now, but free on 2026-11-18
  const discussionRoom = INITIAL_SPACES.find((s) => s.id === 'SPC-004')!;
  assert.equal(
    isSpaceAvailableForSlot(
      discussionRoom,
      '2026-11-18',
      '10:00',
      '12:00',
      INITIAL_RESERVATIONS
    ),
    true
  );
});

test('canAccessPage enforces role permissions strictly', () => {
  assert.equal(canAccessPage('Student', 'discover-spaces'), true);
  assert.equal(canAccessPage('Student', 'manage-users'), false);
  assert.equal(canAccessPage('Lecturer', 'manage-spaces'), false);
  assert.equal(canAccessPage('Administrator', 'manage-users'), true);
  assert.equal(canAccessPage('Administrator', 'admin-dashboard'), true);
});

test('getAdminAnalyticsData summarizes counts accurately', () => {
  const analytics = getAdminAnalyticsData(
    INITIAL_USERS,
    INITIAL_SPACES,
    INITIAL_RESERVATIONS
  );
  assert.equal(analytics.totalUsers, INITIAL_USERS.length);
  assert.equal(analytics.totalSpaces, INITIAL_SPACES.length);
  assert.equal(analytics.totalReservations, INITIAL_RESERVATIONS.length);
  assert.ok(analytics.popularSpaces.length > 0);
});

test('getMonthGridDays generates Monday-first grid with accurate day counts', () => {
  // November 2026: Nov 1 is Sunday, so Monday-first grid starts Oct 26 (Mon) and has 42 cells (Nov 1..30 + padding)
  const nov2026 = getMonthGridDays(2026, 10);
  assert.equal(nov2026.length, 42);
  assert.equal(nov2026[0].dateStr, '2026-10-26');
  assert.equal(nov2026[0].inCurrentMonth, false);
  assert.equal(nov2026[6].dateStr, '2026-11-01');
  assert.equal(nov2026[6].inCurrentMonth, true);
  const inMonthCount = nov2026.filter((d) => d.inCurrentMonth).length;
  assert.equal(inMonthCount, 30);

  // February 2026 (non-leap year): 28 days
  const feb2026 = getMonthGridDays(2026, 1);
  assert.equal(feb2026.filter((d) => d.inCurrentMonth).length, 28);
});

test('groupReservationsByDate groups and sorts reservations chronologically', () => {
  const grouped = groupReservationsByDate(INITIAL_RESERVATIONS);
  assert.ok(Array.isArray(grouped['2026-11-12']));
  assert.ok(grouped['2026-11-12'].length >= 2);
  const times = grouped['2026-11-12'].map((r) => r.startTime);
  const sorted = [...times].sort();
  assert.deepEqual(times, sorted);
});

test('buildCheckInQrData produces deterministic check-in code and valid JSON QR payload', () => {
  const sample = INITIAL_RESERVATIONS[0];
  const first = buildCheckInQrData(sample);
  const second = buildCheckInQrData(sample);

  assert.equal(first.checkInCode, second.checkInCode);
  assert.match(first.checkInCode, /^UNI-[A-Z0-9]{6}$/);

  const parsed = JSON.parse(first.qrPayload);
  assert.equal(parsed.system, 'UniSpace');
  assert.equal(parsed.action, 'room-checkin');
  assert.equal(parsed.bookingId, sample.id);
  assert.equal(parsed.spaceId, sample.spaceId);
  assert.equal(parsed.code, first.checkInCode);
});

test('buildRoomWallQrPayload and parseRoomWallQrPayload resolve room directly across formats', () => {
  const payload = buildRoomWallQrPayload('SPC-003');
  assert.equal(payload, 'UNISPACE:ROOM:SPC-003');

  assert.equal(parseRoomWallQrPayload(payload, INITIAL_SPACES)?.id, 'SPC-003');
  assert.equal(
    parseRoomWallQrPayload('https://unispace.apu.edu.my/?room=SPC-009', INITIAL_SPACES)?.id,
    'SPC-009'
  );
  assert.equal(
    parseRoomWallQrPayload('{"system":"UniSpace","spaceId":"SPC-003"}', INITIAL_SPACES)?.id,
    'SPC-003'
  );
  assert.equal(
    parseRoomWallQrPayload('B-09-03', INITIAL_SPACES)?.id,
    'SPC-003'
  );
  assert.equal(parseRoomWallQrPayload('UNKNOWN-QR-DATA', INITIAL_SPACES), null);
});


