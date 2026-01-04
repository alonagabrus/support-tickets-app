using System;
using System.Linq;
using Backend.Constants;

namespace Backend.Models;

public class Ticket
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = ApplicationConstants.TicketStatus.New;
    public string Resolution { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static string[] AllowedStatuses => ApplicationConstants.TicketStatus.AllStatuses;

    public bool IsValidStatus(string status)
    {
        return AllowedStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}
