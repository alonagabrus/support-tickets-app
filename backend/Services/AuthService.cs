using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class AuthService
{
    private readonly string _username;
    private readonly string _password;
    private readonly string _jwtKey;

    public AuthService(IConfiguration configuration)
    {
        if (configuration == null)
            throw new ArgumentNullException(nameof(configuration));

        _username = GetSetting(configuration, "AUTH_USERNAME", "Auth:Username", "");
        _password = GetSetting(configuration, "AUTH_PASSWORD", "Auth:Password", "");
        _jwtKey = GetJwtKey(configuration);
    }

    public LoginResponse? Authenticate(LoginRequest request)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (!string.Equals(request.Username, _username, StringComparison.Ordinal) ||
            !string.Equals(request.Password, _password, StringComparison.Ordinal))
        {
            return null;
        }

        return new LoginResponse
        {
            Token = GenerateToken(request.Username),
            Username = request.Username
        };
    }

    private string GenerateToken(string username)
    {
        var keyBytes = Encoding.UTF8.GetBytes(_jwtKey);
        var key = new SymmetricSecurityKey(keyBytes);
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GetSetting(IConfiguration configuration, string envName, string configKey, string defaultValue)
    {
        var fromEnv = Environment.GetEnvironmentVariable(envName);
        if (!string.IsNullOrWhiteSpace(fromEnv))
            return fromEnv;

        var fromConfig = configuration[configKey];
        if (!string.IsNullOrWhiteSpace(fromConfig))
            return fromConfig;

        return defaultValue;
    }

    private static string GetJwtKey(IConfiguration configuration)
    {
        var fromEnv = Environment.GetEnvironmentVariable("JWT_KEY");
        if (!string.IsNullOrWhiteSpace(fromEnv))
        {
            if (fromEnv.Length < 32)
                throw new InvalidOperationException($"JWT_KEY must be at least 32 characters. Current: {fromEnv.Length}");
            return fromEnv;
        }

        var fromConfig = configuration["Jwt:Key"];
        if (!string.IsNullOrWhiteSpace(fromConfig))
        {
            if (fromConfig.Length < 32)
                throw new InvalidOperationException($"Jwt:Key must be at least 32 characters. Current: {fromConfig.Length}");
            return fromConfig;
        }

        throw new InvalidOperationException(
            "JWT key is not configured. Set JWT_KEY environment variable or Jwt:Key in configuration. " +
            "The key should be generated during application startup in Program.cs.");
    }
}
