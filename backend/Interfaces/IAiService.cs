using System.Threading;
using System.Threading.Tasks;

namespace Backend.Interfaces;


//Service for AI-powered operations

public interface IAiService
{

    Task<string?> GenerateSummaryAsync(string description, CancellationToken cancellationToken = default);
}
