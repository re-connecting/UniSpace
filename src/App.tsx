import { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { DiscoverSpacesPage } from './components/DiscoverSpacesPage';
import { LayoutShell } from './components/LayoutShell';
import { LecturerDashboard } from './components/LecturerDashboard';
import { LoginPage } from './components/LoginPage';
import { ManageReservationsPage } from './components/ManageReservationsPage';
import { ManageSpacesPage } from './components/ManageSpacesPage';
import { ManageUsersPage } from './components/ManageUsersPage';
import { MyReservationsPage } from './components/MyReservationsPage';
import { ProfilePage } from './components/ProfilePage';
import { ReservationConfirmationPage } from './components/ReservationConfirmationPage';
import { RoomQrScannerModal } from './components/RoomQrScannerModal';
import { SettingsPage } from './components/SettingsPage';
import { SmartRecommendationsPage } from './components/SmartRecommendationsPage';
import { PrefilledSlot, SpaceDetailsPage } from './components/SpaceDetailsPage';
import { StudentDashboard } from './components/StudentDashboard';
import {
  DEFAULT_TODAY,
  INITIAL_NOTIFICATIONS,
  INITIAL_RESERVATIONS,
  INITIAL_SPACES,
  INITIAL_USERS,
} from './data/seedData';
import {
  AccountStatus,
  AppNotification,
  BookingPurpose,
  BuildingName,
  PageId,
  Reservation,
  ReservationStatus,
  SpaceSearchFilters,
  SpaceType,
  StudySpace,
  User,
} from './types/unispace';
import {
  canAccessPage,
  generateBookingId,
  getHomePageForRole,
} from './utils/unispaceLogic';

const DEFAULT_FILTERS: SpaceSearchFilters = {
  query: '',
  building: 'All',
  spaceType: 'All',
  minCapacity: 'All',
  facilities: [],
  date: '',
  startTime: '',
  endTime: '',
  sortBy: 'recommended',
};

const STORAGE_KEY = 'unispace_apu_state_v2';

interface PersistedState {
  users: User[];
  spaces: StudySpace[];
  reservations: Reservation[];
  notifications: AppNotification[];
  currentUserId: string | null;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (parsed.users && parsed.spaces && parsed.reservations) {
        return {
          users: parsed.users,
          spaces: (() => {
            const migrated = parsed.spaces.map((s) => ({
              ...s,
              spaceType:
                (s.spaceType as string) === 'Group Study Room'
                  ? ('Discussion Room' as SpaceType)
                  : s.spaceType,
              facilities: s.facilities.filter(
                (f) => (f as string) !== 'Air Conditioning'
              ),
            }));
            const labRoom = INITIAL_SPACES.find((x) => x.id === 'SPC-009');
            if (labRoom && !migrated.some((s) => s.id === labRoom.id)) {
              migrated.push(labRoom);
            }
            return migrated;
          })(),
          reservations: parsed.reservations,
          notifications: parsed.notifications ?? INITIAL_NOTIFICATIONS,
          currentUserId: parsed.currentUserId ?? null,
        };
      }
    }
  } catch {
    // Ignore storage read errors and fall back to seed data
  }
  return {
    users: INITIAL_USERS,
    spaces: INITIAL_SPACES,
    reservations: INITIAL_RESERVATIONS,
    notifications: INITIAL_NOTIFICATIONS,
    currentUserId: null,
  };
}

export default function App() {
  const initial = loadInitialState();

  const [users, setUsers] = useState<User[]>(initial.users);
  const [spaces, setSpaces] = useState<StudySpace[]>(initial.spaces);
  const [reservations, setReservations] = useState<Reservation[]>(
    initial.reservations
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(
    initial.notifications
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !initial.currentUserId) {
      return INITIAL_USERS[0].id;
    }
    return initial.currentUserId;
  });

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;

  const [activePage, setActivePage] = useState<PageId>(() =>
    currentUser ? getHomePageForRole(currentUser.role) : 'login'
  );
  const [filters, setFilters] = useState<SpaceSearchFilters>(DEFAULT_FILTERS);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    INITIAL_SPACES[2].id
  );
  const [prefilledSlot, setPrefilledSlot] = useState<PrefilledSlot | undefined>(
    undefined
  );
  const [latestReservationId, setLatestReservationId] = useState<string | null>(
    null
  );
  const [focusAnalytics, setFocusAnalytics] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // Support direct ?room=SPC-xxx links from physical phone QR camera scans
  useEffect(() => {
    if (!currentUser || currentUser.role === 'Administrator') return;
    const roomParam = new URLSearchParams(window.location.search).get('room');
    if (roomParam) {
      const matched = spaces.find(
        (s) => s.isActive && s.id.toLowerCase() === roomParam.toLowerCase()
      );
      if (matched) {
        setSelectedSpaceId(matched.id);
        setActivePage('space-details');
      }
    }
  }, [currentUser?.id]);

  // Ensure dark class is never left active on document root
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Persist workspace state locally so reloads retain bookings and edits
  useEffect(() => {
    try {
      const state: PersistedState = {
        users,
        spaces,
        reservations,
        notifications,
        currentUserId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [users, spaces, reservations, notifications, currentUserId]);

  const handleLogin = (user: User) => {
    setCurrentUserId(user.id);
    const roomParam = new URLSearchParams(window.location.search).get('room');
    const matchedRoom =
      roomParam && user.role !== 'Administrator'
        ? spaces.find(
            (s) => s.isActive && s.id.toLowerCase() === roomParam.toLowerCase()
          )
        : undefined;
    if (matchedRoom) {
      setSelectedSpaceId(matchedRoom.id);
      setActivePage('space-details');
    } else {
      setActivePage(getHomePageForRole(user.role));
    }
    setFocusAnalytics(false);
    window.scrollTo({ top: 0 });
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setActivePage('login');
    setFocusAnalytics(false);
    window.scrollTo({ top: 0 });
  };

  const handleRegisterStudent = (payload: {
    fullName: string;
    email: string;
    department: string;
    studentId: string;
    password: string;
  }) => {
    const exists = users.some(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (exists) {
      return {
        ok: false,
        error: 'An account with this APU email already exists.',
      };
    }

    const newUser: User = {
      id: `USR-${1001 + users.length}`,
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      password: payload.password,
      role: 'Student',
      department: payload.department || 'General Studies',
      studentOrStaffId: payload.studentId,
      accountStatus: 'Active',
      registrationDate: DEFAULT_TODAY,
    };

    setUsers((prev) => [...prev, newUser]);
    return { ok: true, user: newUser };
  };

  const handleNavigate = (
    page: PageId,
    options?: { focusAnalytics?: boolean }
  ) => {
    if (!currentUser) {
      setActivePage('login');
      return;
    }
    if (!canAccessPage(currentUser.role, page)) {
      setActivePage(getHomePageForRole(currentUser.role));
      return;
    }
    setFocusAnalytics(Boolean(options?.focusAnalytics));
    setActivePage(page);
    window.scrollTo({ top: 0 });
  };

  const handleViewSpaceDetails = (spaceId: string, prefill?: PrefilledSlot) => {
    setSelectedSpaceId(spaceId);
    setPrefilledSlot(prefill);
    handleNavigate('space-details');
  };

  const handleConfirmBooking = (payload: {
    spaceId: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
    purpose: BookingPurpose;
  }) => {
    if (!currentUser) return;
    const newId = generateBookingId(reservations.length);
    const space = spaces.find((s) => s.id === payload.spaceId);

    const newReservation: Reservation = {
      id: newId,
      spaceId: payload.spaceId,
      userId: currentUser.id,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      attendees: payload.attendees,
      purpose: payload.purpose,
      status: 'Upcoming',
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newReservation, ...prev]);
    setNotifications((prev) => [
      {
        id: `NTF-${Date.now()}`,
        userId: currentUser.id,
        title: `Booking Confirmed (${newId})`,
        message: `${space?.name || payload.spaceId} reserved for ${payload.date}, ${payload.startTime}–${payload.endTime}.`,
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
    setLatestReservationId(newId);
    setPrefilledSlot(undefined);
    handleNavigate('reservation-confirmation');
  };

  const handleCancelUserReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: 'Cancelled' } : r
      )
    );
  };

  const handleCheckInReservation = (reservationId: string) => {
    const checkedInAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const target = reservations.find((r) => r.id === reservationId);
    const space = target ? spaces.find((s) => s.id === target.spaceId) : undefined;

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId && !r.checkedInAt ? { ...r, checkedInAt } : r
      )
    );

    if (currentUser && target && !target.checkedInAt) {
      setNotifications((prev) => [
        {
          id: `NTF-${Date.now()}`,
          userId: currentUser.id,
          title: `Checked In (${target.id})`,
          message: `You checked into ${space?.name || target.spaceId} at ${checkedInAt}.`,
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const handleSaveSpace = (space: StudySpace, isNew: boolean) => {
    setSpaces((prev) =>
      isNew ? [space, ...prev] : prev.map((s) => (s.id === space.id ? space : s))
    );
  };

  const handleToggleSpaceActive = (spaceId: string) => {
    setSpaces((prev) =>
      prev.map((s) => (s.id === spaceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleAdminUpdateReservationStatus = (
    reservationId: string,
    status: ReservationStatus
  ) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
    );
  };

  const handleAddLecturer = (lecturer: User) => {
    const exists = users.some(
      (u) => u.email.toLowerCase() === lecturer.email.toLowerCase()
    );
    if (exists) {
      return {
        ok: false,
        error: 'A user with this university email already exists.',
      };
    }
    setUsers((prev) => [lecturer, ...prev]);
    return { ok: true };
  };

  const handleUpdateAccountStatus = (userId: string, status: AccountStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u))
    );
  };

  const handleUpdateProfile = (updates: {
    fullName: string;
    department: string;
  }) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              fullName: updates.fullName,
              department: updates.department,
            }
          : u
      )
    );
  };

  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, password: newPassword } : u
      )
    );
  };

  const handleMarkAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.userId === currentUser.id || n.userId === 'ALL'
          ? { ...n, read: true }
          : n
      )
    );
  };

  if (!currentUser || activePage === 'login') {
    return (
      <LoginPage
        users={users}
        onLogin={handleLogin}
        onRegisterStudent={handleRegisterStudent}
      />
    );
  }

  const pageTitles: Record<PageId, string> = {
    login: 'Sign In',
    'student-dashboard': 'Student Dashboard',
    'lecturer-dashboard': 'Lecturer Dashboard',
    'discover-spaces': 'Discover Study Spaces',
    'space-details': 'Study Space Details & Reservation',
    'reservation-confirmation': 'Reservation Confirmation',
    'my-reservations': 'My Reservations',
    'smart-recommendations': 'Smart Space Recommendations',
    'admin-dashboard': 'Administrator Dashboard',
    'manage-spaces': 'Manage Study Spaces',
    'manage-reservations': 'Manage Reservations',
    'manage-users': 'Manage Users',
    profile: 'Profile',
    settings: 'Settings',
  };

  const selectedSpace =
    spaces.find((s) => s.id === selectedSpaceId) || spaces[0];
  const latestReservation =
    reservations.find((r) => r.id === latestReservationId) || reservations[0];

  return (
    <LayoutShell
      user={currentUser}
      activePage={activePage}
      pageTitle={pageTitles[activePage]}
      notifications={notifications}
      onNavigate={handleNavigate}
      onQuickSearch={
        currentUser.role !== 'Administrator'
          ? () => handleNavigate('discover-spaces')
          : () => handleNavigate('manage-spaces')
      }
      onOpenQrScanner={
        currentUser.role !== 'Administrator'
          ? () => setQrScannerOpen(true)
          : undefined
      }
      onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      onLogout={handleLogout}
    >
      {activePage === 'student-dashboard' && (
        <StudentDashboard
          user={currentUser}
          spaces={spaces}
          reservations={reservations}
          onQuickSearch={(query, building: BuildingName | 'All') => {
            setFilters({ ...DEFAULT_FILTERS, query, building });
            handleNavigate('discover-spaces');
          }}
          onDiscoverSpaces={() => {
            setFilters(DEFAULT_FILTERS);
            handleNavigate('discover-spaces');
          }}
          onOpenQrScanner={() => setQrScannerOpen(true)}
          onViewSpaceDetails={(id) => handleViewSpaceDetails(id)}
          onViewReservations={() => handleNavigate('my-reservations')}
        />
      )}

      {activePage === 'lecturer-dashboard' && (
        <LecturerDashboard
          user={currentUser}
          spaces={spaces}
          reservations={reservations}
          onQuickRoomFilter={({ query, spaceType, minCapacity }) => {
            setFilters({
              ...DEFAULT_FILTERS,
              query: query ?? '',
              spaceType: (spaceType as SpaceType | 'All') ?? 'All',
              minCapacity: minCapacity ?? 'All',
            });
            handleNavigate('discover-spaces');
          }}
          onOpenQrScanner={() => setQrScannerOpen(true)}
          onViewSpaceDetails={(id) => handleViewSpaceDetails(id)}
          onViewReservations={() => handleNavigate('my-reservations')}
        />
      )}

      {activePage === 'discover-spaces' && (
        <DiscoverSpacesPage
          spaces={spaces}
          reservations={reservations}
          filters={filters}
          onApplyFilters={setFilters}
          onResetFilters={() => setFilters(DEFAULT_FILTERS)}
          onViewSpaceDetails={(id) => handleViewSpaceDetails(id)}
        />
      )}

      {activePage === 'space-details' && selectedSpace && (
        <SpaceDetailsPage
          space={selectedSpace}
          userRole={currentUser.role}
          reservations={reservations}
          prefilledSlot={prefilledSlot}
          onBack={() => handleNavigate('discover-spaces')}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {activePage === 'reservation-confirmation' && latestReservation && (
        <ReservationConfirmationPage
          reservation={latestReservation}
          space={spaces.find((s) => s.id === latestReservation.spaceId)}
          onViewMyReservations={() => handleNavigate('my-reservations')}
          onBackToDashboard={() =>
            handleNavigate(getHomePageForRole(currentUser.role))
          }
        />
      )}

      {activePage === 'my-reservations' && (
        <MyReservationsPage
          user={currentUser}
          reservations={reservations}
          spaces={spaces}
          onCancelReservation={handleCancelUserReservation}
          onCheckInReservation={handleCheckInReservation}
          onDiscoverSpaces={() => handleNavigate('discover-spaces')}
        />
      )}

      {activePage === 'smart-recommendations' && (
        <SmartRecommendationsPage
          spaces={spaces}
          reservations={reservations}
          onViewSpaceDetails={(id, prefill) =>
            handleViewSpaceDetails(id, prefill)
          }
        />
      )}

      {activePage === 'admin-dashboard' && (
        <AdminDashboard
          users={users}
          spaces={spaces}
          reservations={reservations}
          focusAnalytics={focusAnalytics}
          onNavigateManageSpaces={() => handleNavigate('manage-spaces')}
          onNavigateManageReservations={() =>
            handleNavigate('manage-reservations')
          }
        />
      )}

      {activePage === 'manage-spaces' && (
        <ManageSpacesPage
          spaces={spaces}
          onSaveSpace={handleSaveSpace}
          onToggleSpaceActive={handleToggleSpaceActive}
        />
      )}

      {activePage === 'manage-reservations' && (
        <ManageReservationsPage
          reservations={reservations}
          spaces={spaces}
          users={users}
          onUpdateStatus={handleAdminUpdateReservationStatus}
        />
      )}

      {activePage === 'manage-users' && (
        <ManageUsersPage
          users={users}
          onAddLecturer={handleAddLecturer}
          onUpdateAccountStatus={handleUpdateAccountStatus}
        />
      )}

      {activePage === 'profile' && (
        <ProfilePage
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {activePage === 'settings' && (
        <SettingsPage
          user={currentUser}
          onUpdatePassword={handleUpdatePassword}
        />
      )}

      <RoomQrScannerModal
        open={qrScannerOpen}
        spaces={spaces}
        onClose={() => setQrScannerOpen(false)}
        onRoomDetected={(spaceId) => {
          setQrScannerOpen(false);
          handleViewSpaceDetails(spaceId);
        }}
      />
    </LayoutShell>
  );
}
