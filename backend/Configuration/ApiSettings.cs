using System;

namespace Backend.Configuration;

public class ApiSettings
{
    public const string SectionName = "Api";
    public CorsSettings Cors { get; set; } = new();
}

public class CorsSettings
{
    public string PolicyName { get; set; } = "AllowFrontend";
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
    public string[] AllowedHeaders { get; set; } = { "Content-Type", "Authorization" };
    public string[] AllowedMethods { get; set; } = { "GET", "POST", "PUT", "DELETE" };
    public bool AllowCredentials { get; set; } = true;
}
