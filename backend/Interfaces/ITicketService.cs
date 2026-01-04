using System.Threading.Tasks;
using Backend.Models.DTOs;

namespace Backend.Interfaces;

public interface ITicketService
{
    Task<PagedResult<TicketDto>> GetTicketsAsync(TicketFilters filters);
    Task<TicketDto?> GetTicketByIdAsync(string id);
    Task<TicketDto> CreateTicketAsync(CreateTicketRequest request);
    Task<TicketDto?> UpdateTicketAsync(string id, UpdateTicketRequest request);
}
