import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../components/common/Table';
import { Ticket } from '../../../types/Ticket';

interface TicketsTableProps {
  tickets: Ticket[];
}

export const TicketsTable: React.FC<TicketsTableProps> = ({ tickets }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const shortenId = (id: string) => {
    return id.substring(0, 8);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'New': 'status-badge-new',
      'In Progress': 'status-badge-progress',
      'Resolved': 'status-badge-resolved',
      'Closed': 'status-badge-closed',
    };

    return (
      <span className={`status-badge ${statusColors[status] || 'status-badge-default'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (ticket: Ticket) => <span className="text-gray-600 font-mono text-sm">{shortenId(ticket.id)}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (ticket: Ticket) => ticket.name,
    },
    {
      key: 'email',
      header: 'Email',
      render: (ticket: Ticket) => ticket.email,
      className: 'hide-mobile',
    },
    {
      key: 'status',
      header: 'Status',
      render: (ticket: Ticket) => getStatusBadge(ticket.status),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (ticket: Ticket) => formatDate(ticket.createdAt),
      className: 'hide-mobile',
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (ticket: Ticket) => formatDate(ticket.updatedAt),
      className: 'hide-mobile',
    },
  ];

  return (
    <Table
      data={tickets}
      columns={columns}
      onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
      emptyMessage="No tickets found"
    />
  );
};
