import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { TextInput } from '../../components/common/TextInput';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { TicketsTable } from './components/TicketsTable';
import { TicketForm } from './components/TicketForm';
import { ticketsApi } from '../../api/ticketsApi';
import { Ticket, CreateTicketRequest } from '../../types/Ticket';

const STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

export const TicketsListPage: React.FC = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    pageSize: 20,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ticketsApi.getTickets(filters);
      setTickets(result.items);
      setPagination({
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters.status, filters.search, filters.page]);

  useEffect(() => {
    if (location.state?.shouldRefresh) {
      loadTickets();
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.shouldRefresh]);

  const updateFilter = (key: 'status' | 'search' | 'page', value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }),
    }));
  };

  const handleCreateTicket = async (request: CreateTicketRequest) => {
    setIsModalOpen(false);
    setIsCreating(true);
    setCreateError(null);

    try {
      await ticketsApi.createTicket(request);
      await loadTickets();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Support Tickets</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Ticket</Button>
        </div>

        <div className="filters-container">
          <Select
            label="Status"
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            className="filter-select"
          />

          <TextInput
            label="Search"
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name, email, or description"
          />
        </div>

        {isCreating && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <LoadingSpinner message="Creating ticket and generating AI summary..." />
          </div>
        )}

        {createError && (
          <ErrorMessage message={createError} className="mb-4" />
        )}

        {loading && (
          <div className="loading-message">
            <LoadingSpinner message="Loading tickets..." />
          </div>
        )}

        {error && (
          <ErrorMessage message={error} onRetry={loadTickets} className="mb-4" />
        )}

        {!loading && !error && (
          <>
            <TicketsTable tickets={tickets} />

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <Button
                  variant="secondary"
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <span className="pagination-info">
                  Page {filters.page} of {pagination.totalPages} ({pagination.totalCount} total)
                </span>
                <Button
                  variant="secondary"
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Ticket">
          <TicketForm
            onSubmit={handleCreateTicket}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isCreating}
          />
        </Modal>
      </div>
    </Layout>
  );
};
