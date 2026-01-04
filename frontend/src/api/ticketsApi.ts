import {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  PagedResult,
  TicketFilters,
} from '../types/Ticket';
import { API_CONFIG, API_ENDPOINTS, HTTP_METHODS } from '../config/apiConfig';

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred'
    }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export const ticketsApi = {
  async getTickets(filters: TicketFilters = {}): Promise<PagedResult<Ticket>> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TICKETS}?${params}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: HTTP_METHODS.GET,
      headers,
    });
    return handleResponse<PagedResult<Ticket>>(response);
  },

  async getTicketById(id: string): Promise<Ticket> {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TICKET_BY_ID(id)}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: HTTP_METHODS.GET,
      headers,
    });
    return handleResponse<Ticket>(response);
  },

  async createTicket(request: CreateTicketRequest): Promise<Ticket> {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TICKETS}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: HTTP_METHODS.POST,
      headers,
      body: JSON.stringify(request),
    });
    return handleResponse<Ticket>(response);
  },

  async updateTicket(id: string, request: UpdateTicketRequest): Promise<Ticket> {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TICKET_BY_ID(id)}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: HTTP_METHODS.PUT,
      headers,
      body: JSON.stringify(request),
    });
    return handleResponse<Ticket>(response);
  },
};
