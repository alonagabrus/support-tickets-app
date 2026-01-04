export interface Ticket {
  id: string;
  name: string;
  email: string;
  description: string;
  summary?: string;
  imageUrl?: string;
  status: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  name: string;
  email: string;
  description: string;
}

export interface UpdateTicketRequest {
  status?: string;
  resolution?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
