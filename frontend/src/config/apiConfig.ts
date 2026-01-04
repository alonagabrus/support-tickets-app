export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  TICKETS: '/api/tickets',
  TICKET_BY_ID: (id: string) => `/api/tickets/${id}`,
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
