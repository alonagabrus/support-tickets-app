using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Interfaces;

public interface IEmailService
{
    Task SendTicketCreatedEmailAsync(Ticket ticket);
    Task SendTicketUpdatedEmailAsync(Ticket ticket, string changeType);
}
