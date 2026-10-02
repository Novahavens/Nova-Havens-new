import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string, base: string): string {
  return path === '/' ? `${base}/` : `${base}${path.replace(/\/+$/, '')}`;
}
