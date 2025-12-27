
import { Room, RoomStatus, Guest, Booking, RoomCategory, Task, TaskStatus, TaskPriority, TaskType, Feedback, StaffMember, StaffStatus, TaskTemplate, UserRole, MenuItem, Conversation, Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    dashboard: 'Dashboard',
    rooms: 'Rooms',
    bookings: 'Bookings',
    guests: 'Guests',
    messages: 'Messaging',
    staff: 'Staff Directory',
    tasks: 'Tasks',
    inbox: 'Staff Inbox',
    feedback: 'Feedback',
    revenue: 'Revenue',
    analytics: 'Analytics',
    settings: 'Settings',
    signOut: 'Sign Out',
    totalRevenue: 'Total Revenue',
    occupancyRate: 'Occupancy Rate',
    guestRating: 'Guest Rating',
    operationTasks: 'Operation Tasks',
    directBookingsBanner: 'Direct Bookings Advantage',
    previewPortal: 'Preview Guest Portal',
    vsLastMonth: 'vs last month',
    unfinishedTasks: 'Unfinished tasks',
    internalReviews: 'internal reviews',
    occupied: 'Occupied'
  },
  fr: {
    dashboard: 'Tableau de bord',
    rooms: 'Chambres',
    bookings: 'Réservations',
    guests: 'Clients',
    messages: 'Messagerie',
    staff: 'Annuaire du personnel',
    tasks: 'Tâches',
    inbox: 'Boîte de réception',
    feedback: 'Commentaires',
    revenue: 'Revenus',
    analytics: 'Analyses',
    settings: 'Paramètres',
    signOut: 'Déconnexion',
    totalRevenue: 'Revenu Total',
    occupancyRate: 'Taux d\'occupation',
    guestRating: 'Note des clients',
    operationTasks: 'Tâches opérationnelles',
    directBookingsBanner: 'Avantage des réservations directes',
    previewPortal: 'Aperçu du portail client',
    vsLastMonth: 'par rapport au mois dernier',
    unfinishedTasks: 'Tâches inachevées',
    internalReviews: 'avis internes',
    occupied: 'Occupé'
  }
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    guestId: 'g1',
    guestName: 'John Doe',
    roomNumber: '101',
    lastMessage: 'Can I get extra towels please?',
    lastTimestamp: new Date().toISOString(),
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'guest', text: 'Hello, our room is great!', timestamp: '2024-05-20T10:00:00Z' },
      { id: 'm2', sender: 'staff', text: 'Glad you like it! Let us know if you need anything.', timestamp: '2024-05-20T10:05:00Z' },
      { id: 'm3', sender: 'guest', text: 'Can I get extra towels please?', timestamp: new Date().toISOString() },
    ]
  },
  {
    id: 'c2',
    guestId: 'g2',
    guestName: 'Jane Smith',
    roomNumber: '301',
    lastMessage: 'Thank you for the wine!',
    lastTimestamp: '2024-05-21T14:30:00Z',
    unreadCount: 0,
    messages: [
      { id: 'm4', sender: 'staff', text: 'Welcome to LuxeStay, Jane!', timestamp: '2024-05-21T14:00:00Z' },
      { id: 'm5', sender: 'guest', text: 'Thank you for the wine!', timestamp: '2024-05-21T14:30:00Z' },
    ]
  }
];

export const INITIAL_MENU: MenuItem[] = [
  { id: 'm1', name: 'Classic Eggs Benedict', description: 'Two poached eggs, Canadian bacon, hollandaise sauce on toasted English muffins.', price: 18, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm2', name: 'Wagyu Beef Burger', description: '8oz Wagyu patty, aged cheddar, caramelized onions, truffle aioli on brioche.', price: 28, category: 'Main Course', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm3', name: 'Wild Mushroom Risotto', description: 'Arborio rice, seasonal forest mushrooms, parmesan reggiano, truffle oil.', price: 24, category: 'Main Course', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm4', name: 'Dark Chocolate Lava Cake', description: 'Warm center, vanilla bean gelato, raspberry coulis.', price: 14, category: 'Desserts', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm5', name: 'Signature Old Fashioned', description: 'Premium bourbon, bitters, orange zest, hand-cut ice.', price: 16, category: 'Drinks', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm6', name: 'Fresh Seasonal Fruit Platter', description: 'Slices of melon, berries, grapes, and exotic tropical fruits.', price: 15, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=400', available: true },
  { id: 'm7', name: 'Artisanal Cheese Board', description: 'Selection of 3 local cheeses, honey, nuts, and crackers.', price: 22, category: 'Snacks', image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=400', available: true },
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', name: 'Maria Garcia', email: 'maria@luxestay.com', password: 'password123', role: 'Head Housekeeper', department: 'Housekeeping', permissionRole: UserRole.HOUSEKEEPING, status: StaffStatus.AVAILABLE, avatar: 'https://picsum.photos/seed/s1/100', phone: '555-0101' },
  { id: 's2', name: 'Dave Miller', email: 'dave@luxestay.com', password: 'password123', role: 'Senior Technician', department: 'Maintenance', permissionRole: UserRole.MAINTENANCE, status: StaffStatus.BUSY, avatar: 'https://picsum.photos/seed/s2/100', phone: '555-0102' },
  { id: 's3', name: 'Sarah Chen', email: 'sarah@luxestay.com', password: 'password123', role: 'Receptionist', department: 'Front Desk', permissionRole: UserRole.FRONT_DESK, status: StaffStatus.AVAILABLE, avatar: 'https://picsum.photos/seed/s3/100', phone: '555-0103' },
  { id: 's4', name: 'James Wilson', email: 'james@luxestay.com', password: 'password123', role: 'Concierge', department: 'Concierge', permissionRole: UserRole.FRONT_DESK, status: StaffStatus.OFFLINE, avatar: 'https://picsum.photos/seed/s4/100', phone: '555-0104' },
  { id: 's5', name: 'Elena Rodriguez', email: 'manager@luxestay.com', password: 'password123', role: 'General Manager', department: 'Management', permissionRole: UserRole.ADMIN, status: StaffStatus.AVAILABLE, avatar: 'https://picsum.photos/seed/s5/100', phone: '555-0105' },
];

export const INITIAL_CATEGORIES: RoomCategory[] = [
  { id: 'cat1', name: 'Single Standard', basePrice: 80, capacity: 1, amenities: ['Free Wi-Fi', 'TV', 'Work Desk', 'Mini Fridge'] },
  { id: 'cat2', name: 'Double Deluxe', basePrice: 120, capacity: 2, amenities: ['Free Wi-Fi', 'Mini Bar', 'Ocean View', 'Smart TV', 'Balcony'] },
  { id: 'cat3', name: 'Executive Suite', basePrice: 250, capacity: 3, amenities: ['Free Wi-Fi', 'Kitchenette', 'Living Area', 'King Bed', 'Nespresso Machine', 'Bath Tub'] },
  { id: 'cat4', name: 'Presidential Villa', basePrice: 850, capacity: 6, amenities: ['Private Pool', 'Butler Service', 'Spa Access', 'Panoramic View', 'Private Gym', 'Library'] },
];

export const INITIAL_ROOMS: Room[] = [
  { id: '1', number: '101', categoryId: 'cat1', status: RoomStatus.AVAILABLE, floor: 1, maintenanceHistory: [] },
  { id: '2', number: '102', categoryId: 'cat1', status: RoomStatus.OCCUPIED, floor: 1, maintenanceHistory: [] },
  { id: '3', number: '103', categoryId: 'cat2', status: RoomStatus.CLEANING, floor: 1, maintenanceHistory: [] },
  { id: '4', number: '201', categoryId: 'cat3', status: RoomStatus.AVAILABLE, floor: 2, maintenanceHistory: [] },
  { id: '5', number: '202', categoryId: 'cat3', status: RoomStatus.MAINTENANCE, floor: 2, maintenanceHistory: [] },
  { id: '6', number: '301', categoryId: 'cat4', status: RoomStatus.OCCUPIED, floor: 3, maintenanceHistory: [] },
  { id: '7', number: '104', categoryId: 'cat2', status: RoomStatus.AVAILABLE, floor: 1, maintenanceHistory: [] },
  { id: '8', number: '203', categoryId: 'cat3', status: RoomStatus.AVAILABLE, floor: 2, maintenanceHistory: [] },
  { id: '9', number: '204', categoryId: 'cat2', status: RoomStatus.AVAILABLE, floor: 2, maintenanceHistory: [] },
  { id: '10', number: '302', categoryId: 'cat4', status: RoomStatus.AVAILABLE, floor: 3, maintenanceHistory: [] },
];

export const INITIAL_GUESTS: Guest[] = [
  { id: 'g1', name: 'John Doe', email: 'john@example.com', phone: '+123456789', location: 'New York, USA', documentId: 'PASS123', nationality: 'USA', ageGroup: '36-50' },
  { id: 'g2', name: 'Jane Smith', email: 'jane@example.com', phone: '+987654321', location: 'London, UK', documentId: 'ID987', nationality: 'UK', ageGroup: '26-35' },
  { id: 'g3', name: 'Hans Mueller', email: 'hans@example.com', phone: '+49123456', location: 'Berlin, Germany', documentId: 'DE444', nationality: 'Germany', ageGroup: '50+' },
  { id: 'g4', name: 'Yuki Tanaka', email: 'yuki@example.com', phone: '+81999888', location: 'Tokyo, Japan', documentId: 'JP555', nationality: 'Japan', ageGroup: '26-35' },
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: '2', guestId: 'g1', checkIn: '2024-05-20', checkOut: '2024-05-25', totalPrice: 400, status: 'checked-in', guestsCount: 1, source: 'Direct' },
  { id: 'b2', roomId: '6', guestId: 'g2', checkIn: '2024-05-21', checkOut: '2024-05-28', totalPrice: 5950, status: 'checked-in', guestsCount: 2, source: 'Booking.com' },
  { id: 'b3', roomId: '1', guestId: 'g3', checkIn: '2024-05-10', checkOut: '2024-05-15', totalPrice: 400, status: 'checked-out', guestsCount: 1, source: 'Expedia' },
  { id: 'b4', roomId: '4', guestId: 'g4', checkIn: '2024-06-01', checkOut: '2024-06-05', totalPrice: 1000, status: 'confirmed', guestsCount: 2, source: 'Airbnb' },
  { id: 'b5', roomId: '7', guestId: 'g1', checkIn: '2024-05-25', checkOut: '2024-05-30', totalPrice: 600, status: 'confirmed', guestsCount: 2, source: 'Direct' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Deep cleaning Room 103',
    description: 'Full sanitized cleaning after check-out. Replace all linens and replenish mini-bar.',
    type: TaskType.CLEANING,
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    roomId: '3',
    assignedStaffId: 's1',
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    title: 'Fix AC in Room 202',
    description: 'Guest reported noise from the air conditioning unit during night time.',
    type: TaskType.MAINTENANCE,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    roomId: '5',
    assignedStaffId: 's2',
    createdAt: new Date().toISOString()
  },
  {
    id: 't3',
    title: 'Welcome Kit Delivery',
    description: 'Deliver premium VIP welcome fruit basket and champagne to Presidential Villa.',
    type: TaskType.SERVICE,
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    roomId: '6',
    assignedStaffId: 's3',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tpl1',
    name: 'Standard Departure Cleaning',
    title: 'Room Cleaning Checklist',
    description: 'Standard cleaning procedure: Strip linens, vacuum floors, sanitize bathroom, replenish amenities, and check for guest items.',
    type: TaskType.CLEANING,
    priority: TaskPriority.MEDIUM
  },
  {
    id: 'tpl2',
    name: 'VIP Welcome Package',
    title: 'New Guest Welcome Package',
    description: 'Arrange welcome card, fruit basket, and sparkling water in the room before arrival.',
    type: TaskType.SERVICE,
    priority: TaskPriority.HIGH
  },
  {
    id: 'tpl3',
    name: 'Routine AC Check',
    title: 'Maintenance: AC Routine Check',
    description: 'Inspect air filters, check refrigerant levels, and ensure thermostat calibration.',
    type: TaskType.MAINTENANCE,
    priority: TaskPriority.LOW
  }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    bookingId: 'b3',
    guestId: 'g3',
    roomId: '1',
    rating: 5,
    comment: 'Wonderful stay! The Single Standard room was surprisingly spacious and quiet.',
    createdAt: '2024-05-16T10:00:00Z'
  },
  {
    id: 'f2',
    bookingId: 'b3',
    guestId: 'g3',
    roomId: '1',
    rating: 4,
    comment: 'Great service, but the breakfast options could be more varied.',
    createdAt: '2024-05-16T11:00:00Z'
  }
];
