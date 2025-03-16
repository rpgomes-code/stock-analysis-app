import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and merges Tailwind classes with tailwind-merge
 * This prevents class conflicts when multiple Tailwind classes target the same CSS property
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency with the specified locale and currency
 */
export function formatCurrency(value: number, locale = 'en-US', currency = 'USD', minimumFractionDigits = 2, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}

/**
 * Formats a number as a percentage with the specified locale
 */
export function formatPercent(value: number, locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value / 100);
}

/**
 * Formats a large number with K, M, B, T suffixes
 */
export function formatNumber(value: number, locale = 'en-US') {
  if (Math.abs(value) >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }

  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Returns a random hex color code
 */
export function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Converts a date string to a formatted date
 */
export function formatDate(dateString: string, formatString = 'yyyy-MM-dd') {
  const date = new Date(dateString);
  return formatString
      .replace('yyyy', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('dd', date.getDate().toString().padStart(2, '0'));
}

/**
 * Truncates text to a specified length with an ellipsis
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Formats volume data for display
 */
export function formatVolume(volume: number) {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }

  return volume.toString();
}

/**
 * Gets a color based on the value's sign (positive or negative)
 */
export function getChangeColor(value: number, defaultColor = '') {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return defaultColor;
}

/**
 * Formats a number with a plus sign for positive values
 */
export function formatWithSign(value: number, minimumFractionDigits = 2, maximumFractionDigits = 2) {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: 'exceptZero'
  });

  return formatter.format(value);
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generates initials from a name
 */
export function getInitials(name: string): string {
  return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
}

/**
 * Calculates percentage change between two values
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Formats a date string to a relative time (e.g., "5 minutes ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} year${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} month${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} day${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute${interval === 1 ? '' : 's'} ago`;
  }

  return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
}

/**
 * Checks if a value is null or undefined
 */
export function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

/**
 * Safely accesses a nested property in an object
 */
export function getNestedProperty(obj: any, path: string, defaultValue: any = undefined) {
  const keys = path.split('.');
  return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : defaultValue), obj);
}