/**
 * Ticket-related constants
 */

export const TICKET_STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
} as const;

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

export const ALL_TICKET_STATUSES = Object.values(TICKET_STATUS);

export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS.NEW]: 'New',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.RESOLVED]: 'Resolved',
  [TICKET_STATUS.CLOSED]: 'Closed',
} as const;

export const TICKET_STATUS_COLORS = {
  [TICKET_STATUS.NEW]: 'bg-blue-100 text-blue-800',
  [TICKET_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TICKET_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
  [TICKET_STATUS.CLOSED]: 'bg-gray-100 text-gray-800',
} as const;

export const STATUS_OPTIONS = [
  { value: TICKET_STATUS.NEW, label: 'New' },
  { value: TICKET_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TICKET_STATUS.RESOLVED, label: 'Resolved' },
  { value: TICKET_STATUS.CLOSED, label: 'Closed' },
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
} as const;

export const VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 256,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_RESOLUTION_LENGTH: 2000,
  MAX_IMAGE_URL_LENGTH: 2048,
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
