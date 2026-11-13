export type UserRole = 'Student' | 'Lecturer' | 'Administrator';

export type AccountStatus = 'Active' | 'Suspended' | 'Pending';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  studentOrStaffId: string;
  accountStatus: AccountStatus;
  registrationDate: string;
}

export type OccupancyStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type SpaceType =
  | 'Individual Desk'
  | 'Discussion Room'
  | 'Tutorial Room'
  | 'Consultation Room'
  | 'Lab Room';

export type BuildingName = 'Block A' | 'Block B' | 'Block D' | 'Block E';

export type Facility =
  | 'Wi-Fi'
  | 'Power Outlets'
  | 'Whiteboard'
  | 'Projector';

export interface StudySpace {
  id: string;
  name: string;
  building: BuildingName;
  floor: string;
  spaceType: SpaceType;
  capacity: number;
  facilities: Facility[];
  occupancyStatus: OccupancyStatus;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export type BookingPurpose =
  | 'Individual Study'
  | 'Group Discussion'
  | 'Assignment Meeting'
  | 'Tutorial'
  | 'Student Consultation'
  | 'Other Academic Activities';

export type ReservationStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Reservation {
  id: string;
  spaceId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendees: number;
  purpose: BookingPurpose;
  status: ReservationStatus;
  createdAt: string;
  notes?: string;
  checkedInAt?: string;
}

export interface RecommendationCriteria {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  preferredSpaceType: SpaceType | 'Any';
  requiredFacilities: Facility[];
  preferredBuilding: BuildingName | 'Any';
}

export interface SpaceRecommendation {
  space: StudySpace;
  score: number;
  isAvailableForSlot: boolean;
  matchingFacilities: Facility[];
  missingFacilities: Facility[];
  capacityFitLabel: string;
  explanation: string;
}

export interface AppNotification {
  id: string;
  userId: string | 'ALL';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type PageId =
  | 'login'
  | 'student-dashboard'
  | 'lecturer-dashboard'
  | 'discover-spaces'
  | 'space-details'
  | 'reservation-confirmation'
  | 'my-reservations'
  | 'smart-recommendations'
  | 'admin-dashboard'
  | 'manage-spaces'
  | 'manage-reservations'
  | 'manage-users'
  | 'profile'
  | 'settings';

export interface SpaceSearchFilters {
  query: string;
  building: BuildingName | 'All';
  spaceType: SpaceType | 'All';
  minCapacity: number | 'All';
  facilities: Facility[];
  date: string;
  startTime: string;
  endTime: string;
  sortBy: 'recommended' | 'available-first' | 'capacity-asc' | 'capacity-desc';
}
