import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }
    
    return parsedDate.toLocaleDateString("en-US", {
      // Removed 'weekday: "long"' from options
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
}

export function formatPrinciple(principle: string): string {
  return principle
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

