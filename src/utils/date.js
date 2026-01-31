/**
 * date.js - Date utility functions
 * Formatting and parsing dates for display and storage
 */

// ============================================
// DATE HELPERS
// ============================================

/**
 * Format date as YYYY-MM-DD (for storage/comparison)
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Format date as MM-DD-YYYY (for display)
 * @param {Date} date
 * @returns {string}
 */
export const formatDisplayDate = (date) => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m}-${d}-${y}`;
};

/**
 * Format date as "Day · Month Date" (for headers)
 * @param {Date} date
 * @returns {string}
 */
export const formatHeaderDate = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${days[date.getDay()]} · ${months[date.getMonth()]} ${date.getDate()}`;
};

/**
 * Get today's date at midnight
 * @returns {Date}
 */
export const getToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};
