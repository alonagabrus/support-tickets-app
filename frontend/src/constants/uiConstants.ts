
export const UI_TEXT = {
  APP_TITLE: 'Support Tickets System',

  // Page titles
  TICKETS_LIST_TITLE: 'Support Tickets',
  TICKET_DETAILS_TITLE: 'Ticket Details',

  // Buttons
  BTN_CREATE_TICKET: 'Create New Ticket',
  BTN_SAVE: 'Save',
  BTN_CANCEL: 'Cancel',
  BTN_SUBMIT: 'Submit',
  BTN_BACK: 'Back to List',
  BTN_PREVIOUS: 'Previous',
  BTN_NEXT: 'Next',
  BTN_RETRY: 'Retry',

  // Form labels
  LABEL_NAME: 'Name',
  LABEL_EMAIL: 'Email',
  LABEL_DESCRIPTION: 'Description',
  LABEL_IMAGE_URL: 'Image URL (optional)',
  LABEL_STATUS: 'Status',
  LABEL_RESOLUTION: 'Resolution',
  LABEL_SEARCH: 'Search',

  // Placeholders
  PLACEHOLDER_NAME: 'Enter your full name',
  PLACEHOLDER_EMAIL: 'your.email@example.com',
  PLACEHOLDER_DESCRIPTION: 'Describe your issue in detail...',
  PLACEHOLDER_IMAGE_URL: 'https://example.com/image.png',
  PLACEHOLDER_RESOLUTION: 'Enter resolution details...',
  PLACEHOLDER_SEARCH: 'Search by name, email, or description...',

  // Validation messages
  VALIDATION_NAME_REQUIRED: 'Name is required',
  VALIDATION_EMAIL_REQUIRED: 'Email is required',
  VALIDATION_EMAIL_INVALID: 'Please enter a valid email',
  VALIDATION_DESCRIPTION_REQUIRED: 'Description is required',
  VALIDATION_DESCRIPTION_TOO_SHORT: 'Description must be at least 10 characters',

  // Status messages
  STATUS_LOADING: 'Loading...',
  STATUS_SAVING: 'Saving...',
  STATUS_SUBMITTING: 'Submitting...',
  STATUS_SUCCESS: 'Changes saved successfully!',

  // Error messages
  ERROR_GENERIC: 'An error occurred. Please try again.',
  ERROR_TIMEOUT: 'Request timeout. Please try again.',
  ERROR_LOADING_TICKETS: 'Failed to load tickets',
  ERROR_LOADING_TICKET: 'Failed to load ticket details',
  ERROR_CREATING_TICKET: 'Failed to create ticket',
  ERROR_UPDATING_TICKET: 'Failed to update ticket',

  // Empty states
  EMPTY_NO_TICKETS: 'No tickets found',
  EMPTY_NO_RESULTS: 'No results match your search',

  // Modal
  MODAL_CREATE_TICKET: 'New Ticket',

  // Pagination
  PAGINATION_SHOWING: (start: number, end: number, total: number) =>
    `Showing ${start}-${end} of ${total} tickets`,
  PAGINATION_PAGE_OF: (current: number, total: number) =>
    `Page ${current} of ${total}`,
} as const;

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 3000,
} as const;
