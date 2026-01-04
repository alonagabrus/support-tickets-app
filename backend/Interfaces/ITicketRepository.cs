using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Interfaces;

public interface ITicketRepository
{
    Task<IEnumerable<Ticket>> GetAllAsync();
    Task<Ticket?> GetByIdAsync(string id);
    Task<Ticket> CreateAsync(Ticket ticket);
    Task<Ticket?> UpdateAsync(Ticket ticket);
}
