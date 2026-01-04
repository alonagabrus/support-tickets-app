using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Constants;
using Backend.Interfaces;
using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.Extensions.Logging;

namespace Backend.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _repository;
    private readonly IEmailService _emailService;
    private readonly IAiService _aiService;
    private readonly ILogger<TicketService> _logger;

    public TicketService(
        ITicketRepository repository,
        IEmailService emailService,
        IAiService aiService,
        ILogger<TicketService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<PagedResult<TicketDto>> GetTicketsAsync(TicketFilters filters)
    {
        var tickets = await _repository.GetAllAsync();
        var searchLower = filters.Search?.ToLowerInvariant();

        var filtered = tickets.Where(t =>
        {
            if (!string.IsNullOrWhiteSpace(filters.Status) &&
                !t.Status.Equals(filters.Status, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (!string.IsNullOrWhiteSpace(searchLower))
            {
                return t.Name.Contains(searchLower, StringComparison.OrdinalIgnoreCase) ||
                       t.Email.Contains(searchLower, StringComparison.OrdinalIgnoreCase) ||
                       t.Description.Contains(searchLower, StringComparison.OrdinalIgnoreCase);
            }

            return true;
        }).ToList();

        var totalCount = filtered.Count;
        var paged = filtered
            .OrderByDescending(t => t.CreatedAt)
            .Skip((filters.Page - 1) * filters.PageSize)
            .Take(filters.PageSize)
            .Select(MapToDto)
            .ToList();

        return new PagedResult<TicketDto>
        {
            Items = paged,
            TotalCount = totalCount,
            Page = filters.Page,
            PageSize = filters.PageSize
        };
    }

    public async Task<TicketDto?> GetTicketByIdAsync(string id)
    {
        var ticket = await _repository.GetByIdAsync(id);
        if (ticket == null)
        {
            _logger.LogWarning("Ticket {TicketId} not found", id);
        }
        return ticket != null ? MapToDto(ticket) : null;
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketRequest request)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        var summary = await _aiService.GenerateSummaryAsync(request.Description);

        var ticket = new Ticket
        {
            Name = request.Name,
            Email = request.Email,
            Description = request.Description,
            Summary = summary,
            ImageUrl = string.Empty,
            Status = ApplicationConstants.TicketStatus.New,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(ticket);
        SendEmailAsync(created, ApplicationConstants.NotificationType.StatusChanged, isCreated: true);

        return MapToDto(created);
    }

    public async Task<TicketDto?> UpdateTicketAsync(string id, UpdateTicketRequest request)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        var ticket = await _repository.GetByIdAsync(id);
        if (ticket == null)
        {
            _logger.LogWarning("Ticket {TicketId} not found for update", id);
            return null;
        }

        var statusChanged = false;
        var resolutionChanged = false;

        if (!string.IsNullOrWhiteSpace(request.Status) &&
            !ticket.Status.Equals(request.Status, StringComparison.OrdinalIgnoreCase))
        {
            if (!ticket.IsValidStatus(request.Status))
            {
                _logger.LogWarning("Invalid status {Status} for ticket {TicketId}", request.Status, id);
                throw new ArgumentException(ApplicationConstants.ErrorMessages.InvalidStatusValue(request.Status));
            }

            ticket.Status = request.Status;
            statusChanged = true;
        }

        if (request.Resolution != null && request.Resolution != ticket.Resolution)
        {
            ticket.Resolution = request.Resolution;
            resolutionChanged = true;
        }

        ticket.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(ticket);
        if (updated == null)
        {
            _logger.LogWarning("Failed to update ticket {TicketId}", id);
            return null;
        }

        if (statusChanged)
        {
            SendEmailAsync(updated, ApplicationConstants.NotificationType.StatusChanged);
        }
        else if (resolutionChanged)
        {
            SendEmailAsync(updated, ApplicationConstants.NotificationType.ResolutionAdded);
        }

        return MapToDto(updated);
    }

    private void SendEmailAsync(Ticket ticket, string changeType, bool isCreated = false)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                if (isCreated)
                {
                    await _emailService.SendTicketCreatedEmailAsync(ticket);
                }
                else
                {
                    await _emailService.SendTicketUpdatedEmailAsync(ticket, changeType);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email notification for ticket {TicketId}", ticket.Id);
            }
        });
    }

    private static TicketDto MapToDto(Ticket ticket)
    {
        return new TicketDto
        {
            Id = ticket.Id,
            Name = ticket.Name,
            Email = ticket.Email,
            Description = ticket.Description,
            Summary = ticket.Summary,
            ImageUrl = ticket.ImageUrl,
            Status = ticket.Status,
            Resolution = ticket.Resolution,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

}
