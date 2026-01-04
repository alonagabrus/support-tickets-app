using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Backend.Configuration;
using Backend.Endpoints;
using Backend.Interfaces;
using Backend.Repositories;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure settings
builder.Services.Configure<ApiSettings>(
    builder.Configuration.GetSection(ApiSettings.SectionName));
builder.Services.Configure<StorageSettings>(
    builder.Configuration.GetSection(StorageSettings.SectionName));
builder.Services.Configure<AiServiceSettings>(
    builder.Configuration.GetSection(AiServiceSettings.SectionName));
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection(EmailSettings.SectionName));

// Register repository
builder.Services.AddSingleton<ITicketRepository, FileBasedTicketRepository>();

// Register services
builder.Services.AddSingleton<IEmailService, SmtpEmailService>();
builder.Services.AddSingleton<IAiService, SummaryGenerationService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<AuthService>();

// Configure JWT
var jwtKey = GetJwtKey(builder.Configuration);

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
var securityKey = new SymmetricSecurityKey(keyBytes);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = securityKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Support Tickets API",
        Version = "v1",
        Description = "API for managing support tickets"
    });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

static void ValidateJwtKey(string key, string source)
{
    if (key.Length < 32)
        throw new InvalidOperationException($"{source} must be at least 32 characters. Current: {key.Length}");
}

static string GenerateJwtKey(IConfiguration configuration)
{
    using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
    var bytes = new byte[64];
    rng.GetBytes(bytes);
    var generatedKey = Convert.ToBase64String(bytes);
    configuration["Jwt:Key"] = generatedKey;
    return generatedKey;
}

static string GetJwtKey(IConfiguration configuration)
{
    var fromEnv = Environment.GetEnvironmentVariable("JWT_KEY");
    if (!string.IsNullOrWhiteSpace(fromEnv))
    {
        ValidateJwtKey(fromEnv, "JWT_KEY");
        return fromEnv;
    }

    var fromConfig = configuration["Jwt:Key"];
    if (!string.IsNullOrWhiteSpace(fromConfig))
    {
        ValidateJwtKey(fromConfig, "Jwt:Key");
        return fromConfig;
    }

    return GenerateJwtKey(configuration);
}

static ApiSettings GetApiSettings(IConfiguration configuration)
{
    return configuration
        .GetSection(ApiSettings.SectionName)
        .Get<ApiSettings>() ?? new ApiSettings();
}

static void ConfigureCors(IServiceCollection services, ApiSettings apiSettings)
{
    services.AddCors(options =>
    {
        options.AddPolicy(apiSettings.Cors.PolicyName, policy =>
        {
            policy.WithOrigins(apiSettings.Cors.AllowedOrigins)
                  .WithHeaders(apiSettings.Cors.AllowedHeaders)
                  .WithMethods(apiSettings.Cors.AllowedMethods);

            if (apiSettings.Cors.AllowCredentials)
            {
                policy.AllowCredentials();
            }
        });
    });
}

var apiSettings = GetApiSettings(builder.Configuration);
ConfigureCors(builder.Services, apiSettings);

var app = builder.Build();

if (app.Environment.EnvironmentName == "Development")
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Support Tickets API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors(apiSettings.Cors.PolicyName);
app.UseAuthentication();
app.UseAuthorization();

ApiEndpoints.MapAuthEndpoints(app);
ApiEndpoints.MapTicketEndpoints(app);

app.Logger.LogInformation("Support Tickets API started successfully");

app.Run();
