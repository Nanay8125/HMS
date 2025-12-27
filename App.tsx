
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RoomGrid from './components/RoomGrid';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TaskBoard from './components/TaskBoard';
import StaffManagement from './components/StaffManagement';
import FeedbackTab from './components/FeedbackTab';
import StaffInbox from './components/StaffInbox';
import RevenueManagement from './components/RevenueManagement';
import GeminiAssistant from './components/GeminiAssistant';
import BookingForm from './components/BookingForm';
import RoomTypeForm from './components/RoomTypeForm';
import RoomForm from './components/RoomForm';
import TaskForm from './components/TaskForm';
import TaskTemplateForm from './components/TaskTemplateForm';
import StaffForm from './components/StaffForm';
import FeedbackForm from './components/FeedbackForm';
import RoomDetailsModal from './components/RoomDetailsModal';
import FollowUpModal from './components/FollowUpModal';
import LoginForm from './components/LoginForm';
import Settings from './components/Settings';
import PublicBookingPortal from './components/PublicBookingPortal';
import MessagingHub from './components/MessagingHub';
import BookingConfirmationModal from './components/BookingConfirmationModal';
import { Room, RoomStatus, Booking, Guest, RoomCategory, Task, TaskStatus, TaskPriority, TaskTemplate, Feedback, StaffEmail, StaffMember, StaffStatus, InAppNotification, UserRole, TaskType, MenuItem, Conversation, Language } from './types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_GUESTS, INITIAL_CATEGORIES, INITIAL_TASKS, INITIAL_TEMPLATES, INITIAL_FEEDBACK, INITIAL_STAFF, INITIAL_CONVERSATIONS, TRANSLATIONS } from './constants';
import { Plus, Search, Filter, CalendarPlus, Info, LayoutTemplate, Box, LogIn, LogOut, CheckCircle2, Sparkles, X, Mail, StickyNote, ShieldAlert, Globe, ShieldCheck } from 'lucide-react';
import { generateCheckInOutMessage, generateStaffNotificationEmail } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'admin' | 'guest'>('admin');
  const [language, setLanguage] = useState<Language>('en');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [categories, setCategories] = useState<RoomCategory[]>(INITIAL_CATEGORIES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [templates, setTemplates] = useState<TaskTemplate[]>(INITIAL_TEMPLATES);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [feedback, setFeedback] = useState<Feedback[]>(INITIAL_FEEDBACK);
  const [staffEmails, setStaffEmails] = useState<StaffEmail[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [followUpBooking, setFollowUpBooking] = useState<Booking | null>(null);
  const [feedbackModalBooking, setFeedbackModalBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | undefined>(undefined);
  const [initialTaskTemplate, setInitialTaskTemplate] = useState<TaskTemplate | undefined>(undefined);
  const [roomViewMode, setRoomViewMode] = useState<'inventory' | 'categories'>('inventory');

  // New Confirmation State
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'in' | 'out' } | null>(null);

  // AI Feedback state
  const [aiMessage, setAiMessage] = useState<{ text: string, type: 'in' | 'out' | 'email' | 'success' } | null>(null);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const handleRoomStatusChange = (roomId: string, newStatus: RoomStatus) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status: newStatus } : room
    ));
  };

  const dispatchStaffEmail = async (type: 'booking_new' | 'check_in' | 'check_out', data: { guest: Guest; room: Room; booking: Booking }) => {
    const { subject, body, dept } = await generateStaffNotificationEmail(type, data);
    const newEmail: StaffEmail = {
      id: `email-${Math.random().toString(36).substr(2, 9)}`,
      recipientDept: dept,
      subject,
      body,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setStaffEmails(prev => [...prev, newEmail]);
    setAiMessage({ text: `Automated memo sent to ${dept} regarding ${data.guest.name}`, type: 'email' });
    setTimeout(() => setAiMessage(null), 5000);
  };

  const handleFoodRequest = (roomId: string, items: { item: MenuItem; quantity: number }[]) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const orderSummary = items.map(i => `${i.quantity}x ${i.item.name}`).join(', ');
    const newTask: Task = {
      id: `food-${Date.now()}`,
      title: `Food Order: Room ${room.number}`,
      description: `In-Room Dining Request: ${orderSummary}. Deliver within 30 minutes.`,
      type: TaskType.SERVICE,
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      roomId: room.id,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    const guest = guests.find(g => bookings.find(b => b.roomId === roomId && b.status === 'checked-in')?.guestId === g.id);
    if (guest) {
      handleIncomingGuestMessage(guest.id, `I've just placed a food order for Room ${room.number}: ${orderSummary}`);
    }

    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      staffId: 's3', 
      title: 'New Dining Request',
      message: `Room ${room.number} ordered: ${orderSummary}`,
      type: 'task',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleIncomingGuestMessage = (guestId: string, text: string) => {
    setConversations(prev => {
      const guest = guests.find(g => g.id === guestId);
      const booking = bookings.find(b => b.guestId === guestId && b.status === 'checked-in');
      const room = rooms.find(r => r.id === booking?.roomId);
      
      const existing = prev.find(c => c.guestId === guestId);
      if (existing) {
        return prev.map(c => c.guestId === guestId ? {
          ...c,
          lastMessage: text,
          lastTimestamp: new Date().toISOString(),
          unreadCount: c.unreadCount + 1,
          messages: [...c.messages, { id: `m-${Date.now()}`, sender: 'guest', text, timestamp: new Date().toISOString() }]
        } : c);
      }

      return [...prev, {
        id: `c-${Date.now()}`,
        guestId,
        guestName: guest?.name || 'Unknown',
        roomNumber: room?.number || 'N/A',
        lastMessage: text,
        lastTimestamp: new Date().toISOString(),
        unreadCount: 1,
        messages: [{ id: `m-${Date.now()}`, sender: 'guest', text, timestamp: new Date().toISOString() }]
      }];
    });
  };

  const handleSendMessageToGuest = (conversationId: string, text: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      lastMessage: text,
      lastTimestamp: new Date().toISOString(),
      unreadCount: 0,
      messages: [...c.messages, { id: `m-${Date.now()}`, sender: 'staff', text, timestamp: new Date().toISOString() }]
    } : c));
  };

  const handleServiceRequest = (roomNumber: string, type: TaskType, details: string, priority: TaskPriority) => {
    const room = rooms.find(r => r.number === roomNumber);
    if (!room) return;

    const newTask: Task = {
      id: `service-${Date.now()}`,
      title: `Service Request: Room ${roomNumber}`,
      description: details,
      type: type,
      priority: priority,
      status: TaskStatus.PENDING,
      roomId: room.id,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    const booking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
    if (booking) {
      handleIncomingGuestMessage(booking.guestId, `[Service Requested: ${type}] ${details}`);
    }

    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      staffId: 's3', 
      title: 'Guest Service Request',
      message: `Room ${roomNumber} needs: ${details}`,
      type: 'task',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleSendFollowUpEmail = (subject: string, body: string) => {
    const guest = guests.find(g => g.id === followUpBooking?.guestId);
    if (!guest) return;

    const newEmail: StaffEmail = {
      id: `email-${Date.now()}`,
      recipientDept: 'Management',
      subject: `Follow-up to ${guest.name}: ${subject}`,
      body,
      type: 'follow_up',
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setStaffEmails(prev => [...prev, newEmail]);
    setAiMessage({ text: `Personalized follow-up sent to ${guest.email}`, type: 'email' });
    setFollowUpBooking(null);
    setTimeout(() => setAiMessage(null), 5000);
  };

  const handleAddBooking = (bookingData: { booking: Booking, newGuest?: Guest }) => {
    const { booking, newGuest } = bookingData;
    
    if (newGuest) {
      setGuests(prev => [...prev, newGuest]);
    }
    
    setBookings(prev => [booking, ...prev]);
    setIsBookingModalOpen(false);
    
    const guest = newGuest || guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    if (guest && room) {
      dispatchStaffEmail('booking_new', { guest, room, booking });
      setAiMessage({ text: `Reservation confirmed for ${guest.name} in Room ${room.number}`, type: 'success' });
      setTimeout(() => setAiMessage(null), 5000);
    }
  };

  const handleGuestDirectBooking = (newBooking: Booking, newGuest: Guest) => {
    setGuests(prev => [...prev, newGuest]);
    setBookings(prev => [newBooking, ...prev]);
    
    const room = rooms.find(r => r.id === newBooking.roomId);
    if (room) {
      dispatchStaffEmail('booking_new', { guest: newGuest, room, booking: newBooking });
    }
  };

  const handleAddRoomType = (newCategory: RoomCategory) => {
    setCategories(prev => [...prev, newCategory]);
    setIsRoomTypeModalOpen(false);
  };

  const handleAddRoom = (newRoom: Room) => {
    setRooms(prev => [...prev, newRoom]);
    setIsRoomModalOpen(false);
  };

  const handleAddStaff = (newStaff: StaffMember) => {
    setStaff(prev => [...prev, newStaff]);
    setIsStaffModalOpen(false);
    setAiMessage({ text: `Success: ${newStaff.name} is now authorized for ${newStaff.permissionRole.replace('_', ' ')} terminal access.`, type: 'success' });
    setTimeout(() => setAiMessage(null), 5000);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (currentUser?.id === staffId) {
      alert("You cannot delete your own account while logged in.");
      return;
    }
    const target = staff.find(s => s.id === staffId);
    setStaff(prev => prev.filter(s => s.id !== staffId));
    if (target) {
       setAiMessage({ text: `Account access revoked for ${target.name}.`, type: 'out' });
       setTimeout(() => setAiMessage(null), 5000);
    }
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setIsTaskModalOpen(false);
    setInitialTaskTemplate(undefined);

    if (newTask.assignedStaffId) {
      const assignedStaff = staff.find(s => s.id === newTask.assignedStaffId);
      if (assignedStaff) {
        const newNotif: InAppNotification = {
          id: `notif-${Date.now()}`,
          staffId: assignedStaff.id,
          title: 'New Task Assigned',
          message: `Task: ${newTask.title}`,
          type: 'task',
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    }
  };

  const handleReorderTask = (taskId: string, newStatus: TaskStatus, targetTaskId?: string) => {
    setTasks(prev => {
      const tasksCopy = [...prev];
      const draggedTaskIndex = tasksCopy.findIndex(t => t.id === taskId);
      if (draggedTaskIndex === -1) return prev;

      const [draggedTask] = tasksCopy.splice(draggedTaskIndex, 1);
      draggedTask.status = newStatus;

      if (targetTaskId) {
        const targetIndex = tasksCopy.findIndex(t => t.id === targetTaskId);
        if (targetIndex !== -1) {
          tasksCopy.splice(targetIndex, 0, draggedTask);
          return tasksCopy;
        }
      }
      return [draggedTask, ...tasksCopy];
    });
  };

  const handleSaveTemplate = (tpl: TaskTemplate) => {
    setTemplates(prev => {
      const exists = prev.find(t => t.id === tpl.id);
      if (exists) return prev.map(t => t.id === tpl.id ? tpl : t);
      return [...prev, tpl];
    });
    setIsTemplateModalOpen(false);
    setEditingTemplate(undefined);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAddFeedback = (newFeedback: Feedback) => {
    setFeedback(prev => [...prev, newFeedback]);
    setFeedbackModalBooking(null);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const handleUpdateTaskPriority = (taskId: string, priority: TaskPriority) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
  };

  const handleUpdateAssignedStaff = (taskId: string, assignedStaffId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedStaffId } : t));
  };

  const handleUpdateStaffStatus = (staffId: string, status: StaffStatus) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, status } : s));
  };

  const handleCheckIn = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);

    if (guest && room) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'checked-in' } : b));
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: RoomStatus.OCCUPIED } : r));
      
      const msg = await generateCheckInOutMessage('in', guest, room);
      setAiMessage({ text: msg || `Welcome ${guest.name}!`, type: 'in' });
      
      dispatchStaffEmail('check_in', { guest, room, booking });
    }
    setConfirmAction(null);
  };

  const handleCheckOut = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);

    if (guest && room) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'checked-out' } : b));
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: RoomStatus.CLEANING } : r));
      
      const msg = await generateCheckInOutMessage('out', guest, room);
      setAiMessage({ text: msg || `Safe travels ${guest.name}!`, type: 'out' });
      
      dispatchStaffEmail('check_out', { guest, room, booking });
      setFeedbackModalBooking(booking);
    }
    setConfirmAction(null);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard rooms={rooms} bookings={bookings} tasks={tasks} feedback={feedback} onPreviewWebsite={() => setViewMode('guest')} language={language} />;
      case 'revenue':
        if ([UserRole.ADMIN, UserRole.MANAGEMENT].includes(currentUser.permissionRole)) {
          return <RevenueManagement rooms={rooms} bookings={bookings} categories={categories} />;
        }
        return <AccessDenied />;
      case 'analytics':
        if ([UserRole.ADMIN, UserRole.MANAGEMENT].includes(currentUser.permissionRole)) {
          return <AnalyticsDashboard rooms={rooms} bookings={bookings} categories={categories} guests={guests} tasks={tasks} staff={staff} />;
        }
        return <AccessDenied />;
      case 'messages':
        return <MessagingHub conversations={conversations} onSendMessage={handleSendMessageToGuest} />;
      case 'tasks':
        const visibleTasks = currentUser.permissionRole === UserRole.HOUSEKEEPING 
          ? tasks.filter(t => t.type === TaskType.CLEANING)
          : currentUser.permissionRole === UserRole.MAINTENANCE
          ? tasks.filter(t => t.type === TaskType.MAINTENANCE)
          : tasks;

        return (
          <TaskBoard 
            tasks={visibleTasks} 
            rooms={rooms} 
            staff={staff}
            templates={templates}
            onUpdateStatus={handleUpdateTaskStatus} 
            onUpdatePriority={handleUpdateTaskPriority}
            onUpdateAssignedStaff={handleUpdateAssignedStaff}
            onReorderTask={handleReorderTask}
            onAddTask={() => {
              setInitialTaskTemplate(undefined);
              setIsTaskModalOpen(true);
            }} 
            onAddTemplate={() => {
              setEditingTemplate(undefined);
              setIsTemplateModalOpen(true);
            }}
            onEditTemplate={(tpl) => {
              setEditingTemplate(tpl);
              setIsTemplateModalOpen(true);
            }}
            onDeleteTemplate={handleDeleteTemplate}
            onUseTemplate={(tpl) => {
              setInitialTaskTemplate(tpl);
              setIsTaskModalOpen(true);
            }}
          />
        );
      case 'staff':
        if ([UserRole.ADMIN, UserRole.MANAGEMENT].includes(currentUser.permissionRole)) {
          return <StaffManagement staff={staff} tasks={tasks} onUpdateStaffStatus={handleUpdateStaffStatus} onAddStaff={() => setIsStaffModalOpen(true)} />;
        }
        return <AccessDenied />;
      case 'inbox':
        return <StaffInbox emails={staffEmails} />;
      case 'feedback':
        if ([UserRole.ADMIN, UserRole.MANAGEMENT].includes(currentUser.permissionRole)) {
          return <FeedbackTab feedback={feedback} guests={guests} rooms={rooms} />;
        }
        return <AccessDenied />;
      case 'settings':
        if (currentUser.permissionRole === UserRole.ADMIN) {
          return <Settings staff={staff} onAddStaff={() => setIsStaffModalOpen(true)} onDeleteStaff={handleDeleteStaff} currentUser={currentUser} />;
        }
        return <AccessDenied />;
      case 'rooms':
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto">
                <button 
                  onClick={() => setRoomViewMode('inventory')}
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    roomViewMode === 'inventory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/10' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Box size={18} />
                  Room Inventory
                </button>
                <button 
                  onClick={() => setRoomViewMode('categories')}
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    roomViewMode === 'categories' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/10' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutTemplate size={18} />
                  Room Types
                </button>
              </div>

              {[UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK].includes(currentUser.permissionRole) && (
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {roomViewMode === 'inventory' ? (
                    <button 
                      onClick={() => setIsRoomModalOpen(true)}
                      className="w-full lg:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-900/10"
                    >
                      <Plus size={18} />
                      Add Room
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsRoomTypeModalOpen(true)}
                      className="w-full lg:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-900/10"
                    >
                      <Plus size={18} />
                      New Room Type
                    </button>
                  )}
                </div>
              )}
            </div>

            {roomViewMode === 'inventory' ? (
              <RoomGrid rooms={rooms} categories={categories} bookings={bookings} onStatusChange={handleRoomStatusChange} onRoomClick={setSelectedRoom} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-black text-slate-800">{cat.name}</h4>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Type ID: {cat.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Base Price</p>
                        <p className="text-xl font-black text-indigo-600">${cat.basePrice}<span className="text-xs font-normal text-slate-400">/nt</span></p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                        <p className="text-xl font-black text-slate-800">{cat.capacity} Guests</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.amenities.map((a, i) => <span key={i} className="px-3 py-1 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm">{a}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'bookings':
        if ([UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK].includes(currentUser.permissionRole)) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Reservations</h2>
                <button onClick={() => setIsBookingModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"><CalendarPlus size={20} />New Booking</button>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Guest</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => {
                      const guest = guests.find(g => g.id === booking.guestId);
                      const room = rooms.find(r => r.id === booking.roomId);
                      return (
                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={`https://picsum.photos/seed/${booking.guestId}/32/32`} className="w-8 h-8 rounded-full" /><div><p className="text-sm font-semibold text-slate-900">{guest?.name}</p><p className="text-xs text-slate-500">{guest?.email}</p></div></div></td>
                          <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">#{room?.number}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600">{booking.checkIn} → {booking.checkOut}</td>
                          <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'checked-in' ? 'bg-indigo-100 text-indigo-700' : booking.status === 'confirmed' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{booking.status}</span></td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                               {booking.status === 'confirmed' && <button onClick={() => setConfirmAction({ id: booking.id, type: 'in' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100"><LogIn size={14} />Check In</button>}
                               {booking.status === 'checked-in' && <button onClick={() => setConfirmAction({ id: booking.id, type: 'out' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100"><LogOut size={14} />Check Out</button>}
                               {booking.status === 'checked-out' && <button onClick={() => setFollowUpBooking(booking)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100"><Mail size={14} />Follow Up</button>}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        return <AccessDenied />;
      case 'guests':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guests.map((guest) => (
              <div key={guest.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <img src={`https://picsum.photos/seed/${guest.id}/48/48`} className="w-12 h-12 rounded-xl" />
                <div className="flex-1"><h4 className="text-lg font-bold text-slate-900">{guest.name}</h4><p className="text-sm text-slate-500 mb-4">{guest.email}</p></div>
              </div>
            ))}
          </div>
        );
      default:
        return <div>Section Coming Soon...</div>;
    }
  };

  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border border-slate-200 text-center">
      <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl mb-4"><ShieldAlert size={48} /></div>
      <h3 className="text-xl font-black text-slate-900 mb-2">Access Denied</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">Your current role does not have permission to access this module.</p>
      <button onClick={() => setActiveTab('dashboard')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">Return to Dashboard</button>
    </div>
  );

  if (!currentUser) return <LoginForm staffMembers={staff} onLogin={setCurrentUser} />;
  if (viewMode === 'guest') return <PublicBookingPortal rooms={rooms} categories={categories} bookings={bookings} onBookingComplete={handleGuestDirectBooking} onFoodRequest={handleFoodRequest} onServiceRequest={handleServiceRequest} onExit={() => setViewMode('admin')} />;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      notificationCount={staffEmails.filter(e => !e.isRead).length}
      inAppNotifications={notifications}
      onMarkNotifRead={handleMarkNotificationRead}
      staff={staff}
      currentUser={currentUser}
      onLogout={() => { setCurrentUser(null); setActiveTab('dashboard'); }}
      language={language}
      onLanguageChange={setLanguage}
    >
      {renderContent()}
      <GeminiAssistant context={{ rooms, bookings, guests }} />
      {aiMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-4 ${aiMessage.type === 'in' ? 'bg-indigo-600 border-indigo-500 text-white' : aiMessage.type === 'email' ? 'bg-emerald-600 border-emerald-500 text-white' : aiMessage.type === 'success' ? 'bg-indigo-700 border-indigo-600 text-white' : 'bg-slate-800 border-slate-700 text-white'}`}>
            <div className="p-2 bg-white/10 rounded-xl">{aiMessage.type === 'email' ? <Mail size={20} /> : aiMessage.type === 'success' ? <ShieldCheck size={20} /> : <Sparkles size={20} />}</div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                {aiMessage.type === 'in' ? 'Check-in Success' : aiMessage.type === 'success' ? 'System Auth' : 'Success'}
              </p>
              <p className="text-sm font-medium leading-relaxed italic">"{aiMessage.text}"</p>
            </div>
            <button onClick={() => setAiMessage(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={18} /></button>
          </div>
        </div>
      )}

      {isBookingModalOpen && <BookingForm rooms={rooms} guests={guests} allBookings={bookings} categories={categories} onClose={() => setIsBookingModalOpen(false)} onSubmit={handleAddBooking} />}
      {isRoomTypeModalOpen && <RoomTypeForm onClose={() => setIsRoomTypeModalOpen(false)} onSubmit={handleAddRoomType} />}
      {isRoomModalOpen && <RoomForm rooms={rooms} categories={categories} onClose={() => setIsRoomModalOpen(false)} onSubmit={handleAddRoom} />}
      {isTaskModalOpen && <TaskForm rooms={rooms} staff={staff} tasks={tasks} templates={templates} initialTemplate={initialTaskTemplate} onClose={() => setIsTaskModalOpen(false)} onSubmit={handleAddTask} />}
      {isTemplateModalOpen && <TaskTemplateForm initialData={editingTemplate} onClose={() => setIsTemplateModalOpen(false)} onSubmit={handleSaveTemplate} />}
      {isStaffModalOpen && <StaffForm onClose={() => setIsStaffModalOpen(false)} onSubmit={handleAddStaff} />}
      {feedbackModalBooking && <FeedbackForm booking={feedbackModalBooking} guest={guests.find(g => g.id === feedbackModalBooking.guestId)} room={rooms.find(r => r.id === feedbackModalBooking.roomId)} onClose={() => setFeedbackModalBooking(null)} onSubmit={handleAddFeedback} />}
      {followUpBooking && <FollowUpModal booking={followUpBooking} guest={guests.find(g => g.id === followUpBooking.guestId)!} onClose={() => setFollowUpBooking(null)} onSend={handleSendFollowUpEmail} />}
      {selectedRoom && <RoomDetailsModal room={selectedRoom} category={categories.find(c => c.id === selectedRoom.categoryId)} bookings={bookings.filter(b => b.roomId === selectedRoom.id).map(b => ({ ...b, guestName: guests.find(g => g.id === b.guestId)?.name }))} feedback={feedback.filter(f => f.roomId === selectedRoom.id)} onClose={() => setSelectedRoom(null)} />}
      
      {/* Confirmation Modal Integration */}
      {confirmAction && (
        <BookingConfirmationModal
          type={confirmAction.type}
          booking={bookings.find(b => b.id === confirmAction.id)!}
          guest={guests.find(g => g.id === bookings.find(b => b.id === confirmAction.id)?.guestId)}
          room={rooms.find(r => r.id === bookings.find(b => b.id === confirmAction.id)?.roomId)}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => confirmAction.type === 'in' ? handleCheckIn(confirmAction.id) : handleCheckOut(confirmAction.id)}
        />
      )}
    </Layout>
  );
};

export default App;
