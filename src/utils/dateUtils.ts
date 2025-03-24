
import { parseISO } from 'date-fns';

/**
 * Checks if a date is included in the course dates array
 */
export const isDateInCourse = (date: Date, dates: string[]) => {
  return dates.some(courseDate => {
    const d = parseISO(courseDate);
    return d.getDate() === date.getDate() && 
           d.getMonth() === date.getMonth() && 
           d.getFullYear() === date.getFullYear();
  });
};

/**
 * Properly converts day index to ensure correct day of week generation
 * JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
 * This function ensures we're using the correct day when generating dates
 */
export const isDayOfWeek = (date: Date, selectedDays: number[]): boolean => {
  const dayOfWeek = date.getDay();
  return selectedDays.includes(dayOfWeek);
};

/**
 * Create a date with the time set to noon to avoid timezone issues
 * This ensures the date is not affected by timezone conversions
 */
export const createStableDate = (year: number, month: number, day: number): Date => {
  const date = new Date(year, month, day, 12, 0, 0);
  return date;
};

/**
 * Normalize a date by setting the time to noon to avoid timezone issues
 */
export const normalizeDate = (date: Date): Date => {
  return createStableDate(date.getFullYear(), date.getMonth(), date.getDate());
};
