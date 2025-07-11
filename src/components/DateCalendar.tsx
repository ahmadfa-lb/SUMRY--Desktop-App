import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: string | null) => void;
  selectedDate: string | null;
}

const DateCalendar: React.FC<CalendarProps> = ({ isOpen, onClose, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;

    return formatDate(date) === selectedDate;
  };

  const handleDateClick = (date: Date) => {
    const formattedDate = formatDate(date);
    // console.log(date);
    // console.log(formattedDate);
    onDateSelect(formattedDate);
    onClose();
  };

  const handleClearDate = () => {
    onDateSelect(null);
    onClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (!isOpen) return null;

  const days = getDaysInMonth(currentDate);
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Calendar Dropdown */}
      <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth} {currentYear}
          </h3>

          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="relative">
              {day ? (
                <button
                  onClick={() => handleDateClick(day)}
                  className={`
                    w-full h-10 text-sm rounded-md transition-colors font-medium
                    ${isDateSelected(day)
                      ? 'bg-[var(--orange)] text-white hover:bg-[var(--orange)]'
                      : 'hover:bg-[var(--light-green)] hover:text-white'
                    }
                  `}
                >
                  {day.getDate()}
                </button>
              ) : (
                <div className="w-full h-10" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={handleClearDate}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 hover:text-white hover:bg-[var(--orange)] rounded-md transition-colors"
          >
            Clear Date
          </button>

          {selectedDate && (
            <span className="text-sm text-gray-600">
              Selected: {new Date(selectedDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default DateCalendar;