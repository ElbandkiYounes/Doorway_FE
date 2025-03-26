/**
 * Calendar view options utility
 * Provides configuration for available calendar views excluding day and week views
 */

export type CalendarViewType = 'month' | 'agenda';

// Available view options for the calendar - day and week removed
export const calendarViewOptions = [
  { value: 'month', label: 'Month' },
  { value: 'agenda', label: 'Agenda' },
];

// Default view for the calendar
export const defaultCalendarView: CalendarViewType = 'month';

// Helper to check if a view type is valid
export const isValidCalendarView = (viewType: string): boolean => {
  return calendarViewOptions.some(option => option.value === viewType);
};
