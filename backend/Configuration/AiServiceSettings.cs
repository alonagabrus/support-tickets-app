namespace Backend.Configuration;

public class AiServiceSettings
{
    public const string SectionName = "AiService";

    public string ApiKey { get; set; } = string.Empty;
    public string ModelName { get; set; } = "gpt-4o-mini";
    public string ApiEndpoint { get; set; } = "https://api.openai.com/v1";
    public int MaxTokens { get; set; } = 150;
    public double Temperature { get; set; } = 0.7;
    public int TimeoutSeconds { get; set; } = 30;
    public bool Enabled { get; set; } = true;
}
