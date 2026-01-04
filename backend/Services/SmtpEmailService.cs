using System;
using System.Threading.Tasks;
using Backend.Configuration;
using Backend.Constants;
using Backend.Interfaces;
using Backend.Models;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Backend.Services;

public class SmtpEmailService : IEmailService
{
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly EmailSettings _settings;
    private const int DefaultMaxRetries = 3;
    private const int DefaultRetryDelaySeconds = 2;

    public SmtpEmailService(IOptions<EmailSettings> settings, ILogger<SmtpEmailService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
    }

    public async Task SendTicketCreatedEmailAsync(Ticket ticket)
    {
        if (ticket == null)
            throw new ArgumentNullException(nameof(ticket));

        var subject = ApplicationConstants.EmailTemplates.TicketCreatedSubject;
        var body = ApplicationConstants.EmailTemplates.TicketCreatedBody(ticket.Id);

        await SendEmailAsync(ticket.Email, subject, body);
    }

    public async Task SendTicketUpdatedEmailAsync(Ticket ticket, string changeType)
    {
        if (ticket == null)
            throw new ArgumentNullException(nameof(ticket));

        var subject = ApplicationConstants.EmailTemplates.TicketUpdatedSubject;
        var body = changeType switch
        {
            ApplicationConstants.NotificationType.StatusChanged =>
                ApplicationConstants.EmailTemplates.StatusUpdatedBody(ticket.Status, ticket.Id),
            ApplicationConstants.NotificationType.ResolutionAdded =>
                ApplicationConstants.EmailTemplates.ResolutionAddedBody(ticket.Resolution, ticket.Id),
            _ => $"Your ticket {ticket.Id} has been updated."
        };

        await SendEmailAsync(ticket.Email, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(_settings.SmtpHost))
        {
            _logger.LogWarning("Cannot send email: SMTP host is not configured");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        var maxRetries = _settings.MaxRetryAttempts > 0 ? _settings.MaxRetryAttempts : DefaultMaxRetries;
        var retryDelay = _settings.RetryDelaySeconds > 0 ? _settings.RetryDelaySeconds : DefaultRetryDelaySeconds;

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                using var client = new SmtpClient();
                await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);

                if (!string.IsNullOrWhiteSpace(_settings.SmtpUsername) && !string.IsNullOrWhiteSpace(_settings.SmtpPassword))
                {
                    await client.AuthenticateAsync(_settings.SmtpUsername, _settings.SmtpPassword);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                return;
            }
            catch (Exception ex)
            {
                if (attempt < maxRetries)
                {
                    var delay = retryDelay * attempt;
                    _logger.LogWarning(ex, "Failed to send email to {To} (attempt {Attempt}/{MaxRetries}). Retrying in {Delay}s...",
                        to, attempt, maxRetries, delay);
                    await Task.Delay(TimeSpan.FromSeconds(delay));
                }
                else
                {
                    _logger.LogError(ex, "Failed to send email to {To} after {MaxRetries} attempts", to, maxRetries);
                    throw;
                }
            }
        }
    }
}

