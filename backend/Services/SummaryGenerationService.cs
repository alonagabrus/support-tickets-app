using System;
using System.Threading;
using System.Threading.Tasks;
using Backend.Configuration;
using Backend.Constants;
using Backend.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI.Chat;

namespace Backend.Services;

public class SummaryGenerationService : IAiService
{
    private readonly ILogger<SummaryGenerationService> _logger;
    private readonly AiServiceSettings _settings;

    public SummaryGenerationService(IOptions<AiServiceSettings> settings, ILogger<SummaryGenerationService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));

        if (!_settings.Enabled || string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            _logger.LogWarning("AI summary generation is disabled");
        }
    }

    public async Task<string?> GenerateSummaryAsync(string description, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            _logger.LogWarning("Cannot generate summary for empty description");
            return null;
        }

        if (!_settings.Enabled || string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            return null;
        }

        if (description.Length > ApplicationConstants.ValidationLimits.MaxDescriptionLength)
        {
            description = description.Substring(0, ApplicationConstants.ValidationLimits.MaxDescriptionLength);
        }

        try
        {
            var client = new OpenAI.OpenAIClient(new System.ClientModel.ApiKeyCredential(_settings.ApiKey));
        var chatClient = client.GetChatClient(_settings.ModelName);

        var messages = new ChatMessage[]
        {
            new SystemChatMessage(ApplicationConstants.AiPrompts.SummarySystemPrompt),
            new UserChatMessage(ApplicationConstants.AiPrompts.SummaryUserPrompt(description))
        };

        var options = new ChatCompletionOptions
        {
            Temperature = (float)_settings.Temperature,
            MaxOutputTokenCount = _settings.MaxTokens
        };

        var completion = await chatClient.CompleteChatAsync(messages, options, cancellationToken);

        if (completion?.Value?.Content == null || completion.Value.Content.Count == 0)
        {
            return null;
        }

            var summary = completion.Value.Content[0].Text?.Trim();
            if (!string.IsNullOrWhiteSpace(summary))
            {
                return summary;
            }

            return null;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Summary generation was cancelled");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate AI summary");
            return null;
        }
    }
}
