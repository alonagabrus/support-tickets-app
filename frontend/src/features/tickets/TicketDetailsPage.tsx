import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ticketsApi } from '../../api/ticketsApi';
import { Ticket, UpdateTicketRequest } from '../../types/Ticket';

export const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    status: '',
    resolution: '',
  });

  useEffect(() => {
    if (id) {
      loadTicket(id);
    }
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketsApi.getTicketById(ticketId);
      setTicket(data);
      setFormData({
        status: data.status,
        resolution: data.resolution,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !ticket) return;

    try {
      setSaving(true);

      const updateRequest: UpdateTicketRequest = {};

      if (formData.status !== ticket.status) {
        updateRequest.status = formData.status;
      }

      if (formData.resolution !== ticket.resolution) {
        updateRequest.resolution = formData.resolution;
      }

      await ticketsApi.updateTicket(id, updateRequest);

      navigate('/tickets', { state: { shouldRefresh: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const statusOptions = [
    { value: 'New', label: 'New' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="loading-message">
            <LoadingSpinner message="Loading ticket..." />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <div className="page-container">
          <div className="error-message">
            <ErrorMessage message={error || 'Ticket not found'} />
            <Link to="/tickets" className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-medium underline">
              ← Back to Tickets
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Ticket Details</h1>
          <Link to="/tickets" className="text-teal-600 hover:text-teal-700 font-medium underline">
            ← Back to List
          </Link>
        </div>

        <div className="ticket-details grid gap-6">
          <div className="detail-section">
            <h2 className="section-title flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ticket Information
            </h2>

            <div className="detail-grid">
              <div className="detail-item">
                <label className="detail-label">Ticket ID</label>
                <div className="detail-value font-mono">{ticket.id}</div>
              </div>

              <div className="detail-item">
                <label className="detail-label">Customer Name</label>
                <div className="detail-value">{ticket.name}</div>
              </div>

              <div className="detail-item">
                <label className="detail-label">Email</label>
                <div className="detail-value">{ticket.email}</div>
              </div>

              <div className="detail-item">
                <label className="detail-label">Created At</label>
                <div className="detail-value">{formatDate(ticket.createdAt)}</div>
              </div>

              <div className="detail-item">
                <label className="detail-label">Last Updated</label>
                <div className="detail-value">{formatDate(ticket.updatedAt)}</div>
              </div>
            </div>

            <div className="detail-item full-width">
              <label className="detail-label">Issue Description</label>
              <div className="detail-value description">{ticket.description}</div>
            </div>

            {ticket.summary && (
              <div className="detail-item full-width">
                <label className="detail-label flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  AI Summary
                </label>
                <div className="ai-summary">
                  <div className="text-gray-900 text-base whitespace-pre-wrap leading-relaxed">{ticket.summary}</div>
                </div>
              </div>
            )}

            {ticket.imageUrl && (
              <div className="detail-item full-width">
                <label className="detail-label">Attached Image</label>
                <img src={ticket.imageUrl} alt="Ticket attachment" className="ticket-image" />
              </div>
            )}
          </div>

          <div className="detail-section">
            <h2 className="section-title flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Ticket
            </h2>

            <Select
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={statusOptions}
            />

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
              <textarea
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Provide resolution details..."
              />
            </div>

            <div className="form-actions">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
