using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Backend.Configuration;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Repositories;

public class FileBasedTicketRepository : ITicketRepository, IDisposable
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true
    };

    public FileBasedTicketRepository(IOptions<StorageSettings> settings)
    {
        _filePath = settings?.Value?.FilePath
            ?? throw new ArgumentNullException(nameof(settings));

        var dir = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(dir))
            Directory.CreateDirectory(dir);

        if (!File.Exists(_filePath))
            File.WriteAllText(_filePath, "[]");
    }

    public async Task<IEnumerable<Ticket>> GetAllAsync()
    {
        await _lock.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(_filePath);
            return JsonSerializer.Deserialize<List<Ticket>>(json, JsonOptions) ?? new();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Ticket?> GetByIdAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return null;

        return (await GetAllAsync())
            .FirstOrDefault(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<Ticket> CreateAsync(Ticket ticket)
    {
        if (ticket == null)
            throw new ArgumentNullException(nameof(ticket));

        ticket.Id = ticket.Id ?? Guid.NewGuid().ToString();

        await _lock.WaitAsync();
        try
        {
            var tickets = (await GetAllInternal())!;
            if (tickets.Any(t => t.Id.Equals(ticket.Id, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Ticket with ID {ticket.Id} already exists");

            tickets.Add(ticket);
            await SaveAllInternal(tickets);
            return ticket;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Ticket?> UpdateAsync(Ticket ticket)
    {
        if (ticket == null || string.IsNullOrWhiteSpace(ticket.Id))
            return null;

        await _lock.WaitAsync();
        try
        {
            var tickets = await GetAllInternal();
            var index = tickets.FindIndex(t => t.Id.Equals(ticket.Id, StringComparison.OrdinalIgnoreCase));
            if (index < 0)
                return null;

            ticket.UpdatedAt = DateTime.UtcNow;
            tickets[index] = ticket;

            await SaveAllInternal(tickets);
            return ticket;
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<List<Ticket>> GetAllInternal()
    {
        var json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<Ticket>>(json, JsonOptions) ?? new();
    }

    private async Task SaveAllInternal(List<Ticket> tickets)
    {
        var json = JsonSerializer.Serialize(tickets, JsonOptions);
        await File.WriteAllTextAsync(_filePath, json);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _lock.Dispose();
        _disposed = true;
    }
}
