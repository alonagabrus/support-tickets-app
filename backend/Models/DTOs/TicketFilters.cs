using Backend.Constants;

namespace Backend.Models.DTOs;

public class TicketFilters
{
    public string? Status { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = ApplicationConstants.Pagination.DefaultPage;
    public int PageSize { get; set; } = ApplicationConstants.Pagination.DefaultPageSize;
}
