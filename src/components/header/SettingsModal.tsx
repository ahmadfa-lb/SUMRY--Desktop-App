import React, { useState, useEffect } from 'react';
import { Settings, X, ExternalLink, DollarSign, ChevronDown, Wrench, BarChart3, Calendar, ChevronLeft, ChevronRight, MessageSquareText, Users, Archive, Package, ShieldCheck, UserPlus, TrashIcon, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WhatsAppTemplatesModal from './WhatsappTemplatesModal';
import ReportAccordionItem from './ReportAccordionItem';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date>(new Date());
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportResults, setReportResults] = useState<{ [key: string]: boolean }>({});
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [users, setUsers] = useState<{ id: number, username: string, created_at: string }[]>([]);
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState('');
  const [deleteUserSuccess, setDeleteUserSuccess] = useState('');
  const [isDeletingUser, setIsDeletingUser] = useState<number | null>(null);

  // Confirmation dialog states
  const [showDeleteUserConfirmation, setShowDeleteUserConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; username: string } | null>(null);


  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const loadUsers = async () => {
    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }
      const allUsers = await api.getAllUsers();
      // console.log(allUsers);
      setUsers(allUsers);

    } catch (error) {
      console.error('Error loading users:', error);
    }
  };


  const handleDeleteUser = async (userId: number, username: string) => {
    if (users.length <= 1) {
      setDeleteUserError('Cannot delete the last user. At least one user must remain.');
      return;
    }

    setUserToDelete({ id: userId, username });
    setShowDeleteUserConfirmation(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setShowDeleteUserConfirmation(false);
    setDeleteUserError('');
    setDeleteUserSuccess('');
    setIsDeletingUser(userToDelete.id);

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const result = await api.deleteUser(userToDelete.id);

      if (result.success) {
        setDeleteUserSuccess(`User "${result.deletedUser}" deleted successfully!`);
        await loadUsers(); // Refresh user list
      } else {
        setDeleteUserError(result.error || 'Failed to delete user');
      }
    } catch (error: any) {
      setDeleteUserError(error.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(null);
      setUserToDelete(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserSuccess('');
    setIsCreatingUser(true);

    // Client-side validation
    if (!newUsername || newUsername.length < 3 || newUsername.length > 8) {
      setCreateUserError('Username must be between 3 and 8 characters');
      setIsCreatingUser(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setCreateUserError('Password must be at least 6 characters');
    }

    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }
      await api.createUser(newUsername, newPassword);
      setCreateUserSuccess(`User '${newUsername}' created successfully!`);
      setNewUsername('');
      setNewPassword('');
      await loadUsers(); // Refresh user list
    } catch (error: any) {
      setCreateUserError(error.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleOpenDataManagement = () => {
    // console.log('Opening Data Management Page');
    navigate('/settings/data-management');
    onClose();
  };

  const handleOpenCustomerDebts = () => {
    // console.log('Opening Customer Debts Page');
    navigate('/settings/customer-debts');
    onClose();
  };

  const handleOpenUsedStock = () => {
    // console.log('Opening Used Stock Page');
    navigate('/used-stock');
    onClose();
  };

  const handleEditMessageTemplates = () => {
    // console.log('Opening Message Templates Editor');
    setShowWhatsAppModal(true);
  };

  // const handleCreateUser = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log('Creating user:', { username: newUsername, password: newPassword });
  //   // Add user creation logic here
  //   setNewUsername('');
  //   setNewPassword('');
  // };

  const handleGenerateReport = (reportType: string) => {
    setIsReportOpen(true);
    // console.log('Generating report:', reportType, 'From:', fromDate, 'To:', toDate);
    setReportResults(prev => ({
      ...prev,
      [reportType]: true
    }));
  };

  const toggleReportExpanded = (reportType: string) => {
    setExpandedReport(expandedReport === reportType ? null : reportType);
    setIsReportOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Pick a date';
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options).replace(',', ',');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (date: Date, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromDate(date);
      setShowFromDatePicker(false);
    } else {
      setToDate(date);
      setShowToDatePicker(false);
    }
  };

  const DatePicker = ({
    isOpen,
    onClose: onDatePickerClose,
    onDateSelect,
    selectedDate,
    type
  }: {
    isOpen: boolean;
    onClose: () => void;
    onDateSelect: (date: Date) => void;
    selectedDate: Date | null;
    type: 'from' | 'to';
  }) => {
    if (!isOpen) return null;

    const days = getDaysInMonth(currentMonth);
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const isSameDay = (date1: Date | null, date2: Date | null) => {
      if (!date1 || !date2) return false;
      return date1.toDateString() === date2.toDateString();
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    // Determine positioning based on type
    const positionClasses = type === 'to'
      ? 'absolute top-30 right-0 z-[9999] mt-1' // Right-align for 'to' calendar
      : 'absolute top-30 left-0 z-[9999] mt-1';  // Left-align for 'from' calendar

    return (
      <>
        {/* Backdrop to close calendar when clicking outside */}
        <div
          className="fixed inset-0 z-[9998]"
          onClick={onDatePickerClose}
        />

        {/* Calendar Dropdown */}
        <div className={`${positionClasses} bg-white border border-gray-200 rounded-md shadow-lg p-4 w-80`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-gray-900">{monthYear}</h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    onClick={() => onDateSelect(day)}
                    className={`w-full h-full text-sm rounded-md transition-colors ${isSameDay(day, selectedDate)
                      ? 'bg-[var(--light-green)] text-white'
                      : isToday(day)
                        ? 'bg-[var(--orange)] text-white'
                        : 'hover:bg-gray-100'
                      }`}
                    type="button"
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onDatePickerClose}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg sm:max-w-lg"
      >
        {/* Modal Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Application Settings</h2>
          <p className="text-sm text-[var(--light-green-2)]">Manage application settings and data.</p>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-3 pl-1 re">
          {/* Data Options Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight flex items-center gap-2 text-lg">
                <Settings className="w-[18px] h-[18px]" />
                Data Options
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-[var(--light-green-2)] mb-3">
                Manage backups, exports, and imports on a dedicated page.
              </p>
              <button
                onClick={handleOpenDataManagement}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full"
              >
                <ExternalLink className="w-[18px] h-[18px] mr-2" />
                Open Data Management Page
              </button>
            </div>
          </div>

          {/* WhatsApp Message Templates Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight flex items-center gap-2 text-lg">
                <MessageSquareText className="w-[18px] h-[18px]" />
                WhatsApp Message Templates
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-[var(--light-green-2)] mb-3">
                Click to open the editor for custom WhatsApp message templates for each repair status.
              </p>
              <button
                onClick={handleEditMessageTemplates}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-10 px-4 py-2 w-full"
              >
                <Settings className="w-[18px] h-[18px] mr-2" />
                Edit Message Templates
              </button>
            </div>
            {<WhatsAppTemplatesModal
              isOpen={showWhatsAppModal}
              onClose={() => setShowWhatsAppModal(false)}
            />}
          </div>

          {/* Customer Management Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight flex items-center gap-2 text-lg">
                <Users className="w-[18px] h-[18px]" />
                Customer Management
              </div>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1.5 text-md">
                  <DollarSign className="w-[16px] h-[16px]" />
                  Customer Debts
                </h4>
                <p className="text-xs text-[var(--light-green-2)] mb-2 ml-7">
                  View and manage outstanding customer payments.
                </p>
                <button
                  onClick={handleOpenCustomerDebts}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 w-full"
                >
                  <ExternalLink className="w-[14px] h-[14px] mr-2" />
                  Open Customer Debts Page
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Management Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight flex items-center gap-2 text-lg">
                <Archive className="w-[18px] h-[18px]" />
                Inventory Management
              </div>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1.5 text-md">
                  <Package className="w-[16px] h-[16px]" />
                  Used Stock List
                </h4>
                <p className="text-xs text-[var(--light-green-2)] mb-2 ml-7">
                  Manage your inventory of used items.
                </p>
                <button
                  onClick={handleOpenUsedStock}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 w-full"
                >
                  <ExternalLink className="w-[14px] h-[14px] mr-2" />
                  Open Used Stock List
                </button>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight flex items-center gap-2 text-lg">
                <BarChart3 className="w-[18px] h-[18px]" />
                Reports
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="w-full relative">
                <ReportAccordionItem
                  reportType="Total Cost Report"
                  icon={DollarSign}
                  isExpanded={expandedReport === "Total Cost Report"}
                  onToggle={() => toggleReportExpanded("Total Cost Report")}
                  fromDate={fromDate}
                  toDate={toDate}
                  showFromDatePicker={showFromDatePicker}
                  showToDatePicker={showToDatePicker}
                  currentMonth={currentMonth}
                  setShowFromDatePicker={setShowFromDatePicker}
                  setShowToDatePicker={setShowToDatePicker}
                  setCurrentMonth={setCurrentMonth}
                  handleDateSelect={handleDateSelect}
                  formatDate={formatDate}
                  DatePicker={DatePicker}
                />

                <ReportAccordionItem
                  reportType="Items Fixed Report"
                  icon={Wrench}
                  isExpanded={expandedReport === "Items Fixed Report"}
                  onToggle={() => toggleReportExpanded("Items Fixed Report")}
                  fromDate={fromDate}
                  toDate={toDate}
                  showFromDatePicker={showFromDatePicker}
                  showToDatePicker={showToDatePicker}
                  currentMonth={currentMonth}
                  setShowFromDatePicker={setShowFromDatePicker}
                  setShowToDatePicker={setShowToDatePicker}
                  setCurrentMonth={setCurrentMonth}
                  handleDateSelect={handleDateSelect}
                  formatDate={formatDate}
                  DatePicker={DatePicker}
                />
              </div>
            </div>
          </div>

          {/* User Administration Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight flex items-center gap-2 text-lg">
                <ShieldCheck className="w-[18px] h-[18px]" />
                User Administration
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-foreground">
                  Create New User
                </h4>
                <form className="space-y-3" onSubmit={handleCreateUser}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      New Username (3-8 characters)
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base file:border-0 file:text-sm file:font-medium placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      placeholder="e.g., tech01"
                      value={newUsername}
                      onChange={(e) => {
                        setNewUsername(e.target.value);
                        setCreateUserError('');
                        setCreateUserSuccess('');
                      }}
                      name="username"
                      maxLength={8}
                      minLength={3}
                      disabled={isCreatingUser}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      New Password (min. 6 characters)
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base file:border-0 file:text-sm file:font-medium placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      placeholder="Min. 6 characters"
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setCreateUserError('');
                        setCreateUserSuccess('');
                      }}
                      name="password"
                      minLength={6}
                      disabled={isCreatingUser}
                      required
                    />
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--light-green)] text-white hover:bg-[var(--light-green-2)] h-10 px-4 py-2"
                    type="submit"
                    disabled={isCreatingUser}
                  >
                    <UserPlus className="w-[16px] h-[16px] mr-2" />
                    {isCreatingUser ? 'Creating...' : 'Create User'}
                  </button>
                </form>
                {createUserError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {createUserError}
                  </div>
                )}
                {createUserSuccess && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">
                    {createUserSuccess}
                  </div>
                )}
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-[var(--light-green-2)]">
                    Existing Users ({users.length})
                  </h5>
                  {deleteUserError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {deleteUserError}
                    </div>
                  )}
                  {deleteUserSuccess && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">
                      {deleteUserSuccess}
                    </div>
                  )}
                  <ul className="list-disc list-inside text-sm text-[var(--light-green-2)] pl-2 max-h-32 overflow-y-auto mt-2">
                    {users.map((user) => (
                      <li className='flex items-center justify-between py-1' key={user.id}>
                        <span>{user.username}</span>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={isDeletingUser === user.id || users.length <= 1}
                          className={`p-1 rounded transition-colors ${users.length <= 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:text-[var(--red)] hover:bg-red-50'
                            }`}
                          title={users.length <= 1 ? 'Cannot delete the last user' : `Delete user "${user.username}"`}
                        >
                          {isDeletingUser === user.id ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className='w-4 h-4' />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {/* Delete User Confirmation Dialog */}
      {showDeleteUserConfirmation && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Delete User</h3>
              <div className="text-gray-600 text-center space-y-2">
                <p>Are you sure you want to delete user <strong>"{userToDelete.username}"</strong>?</p>
                <p className="text-sm text-red-600 font-medium">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteUserConfirmation(false);
                  setUserToDelete(null);
                }}
                className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;