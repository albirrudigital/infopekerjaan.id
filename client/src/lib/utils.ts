import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date in Indonesian format
 * @param date - Date to format
 * @returns Formatted date string like "5 Januari 2025"
 */
export function formatDate(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: id });
}

/**
 * Format seconds to MM:SS format
 * @param seconds - Number of seconds
 * @returns Formatted time string like "05:30"
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}