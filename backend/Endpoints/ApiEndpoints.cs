using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Backend.Constants;
using Backend.Interfaces;
using Backend.Models.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Backend.Endpoints;

public static class ApiEndpoints
{
    private static bool IsValidLoginRequest(LoginRequest? request)
    {
        return request != null
            && !string.IsNullOrWhiteSpace(request.Username)
            && !string.IsNullOrWhiteSpace(request.Password);
    }

    private static TicketFilters CreateTicketFilters(string? status, string? search, int page, int pageSize)
    {
        return new TicketFilters
        {
            Status = status,
            Search = search,
            Page = page,
            PageSize = pageSize
        };
    }
    private static IResult? ValidateRequest(object request)
    {
        var validationContext = new ValidationContext(request);
        var validationResults = new List<ValidationResult>();

        if (!Validator.TryValidateObject(request, validationContext, validationResults, true))
        {
            var errors = validationResults.Select(vr => vr.ErrorMessage).ToList();
            return Results.BadRequest(new { errors });
        }

        return null;
    }

    private static IResult HandleTicketError(Exception ex, ILogger logger, string operation)
    {
        if (ex is ArgumentException argEx)
        {
            logger.LogWarning(argEx, "Invalid argument when {Operation}", operation);
            return Results.BadRequest(new { message = argEx.Message });
        }

        logger.LogError(ex, "Error {Operation}", operation);
        return Results.Problem(
            detail: $"An error occurred while {operation}",
            statusCode: StatusCodes.Status500InternalServerError);
    }

    public static void MapAuthEndpoints(WebApplication app)
    {
        app.MapPost("/api/auth/login", ([FromServices] AuthService authService, [FromBody] LoginRequest request) =>
            !IsValidLoginRequest(request) ? Results.BadRequest(new { message = "Username and password are required" }) :
            authService.Authenticate(request) is { } response ? Results.Ok(response) : Results.Unauthorized())
            .WithName("Login").WithTags("Auth")
            .Produces<LoginResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .AllowAnonymous();
    }

    public static void MapTicketEndpoints(WebApplication app)
    {
        var ticketGroup = app.MapGroup("/api/tickets")
            .RequireAuthorization()
            .WithTags("Tickets");

        ticketGroup.MapGet("", async ([FromServices] ITicketService ticketService, [FromQuery] string? status, [FromQuery] string? search, [FromQuery] int page = ApplicationConstants.Pagination.DefaultPage, [FromQuery] int pageSize = ApplicationConstants.Pagination.DefaultPageSize) =>
            Results.Ok(await ticketService.GetTicketsAsync(CreateTicketFilters(status, search, page, pageSize))))
            .WithName("GetTickets").Produces<PagedResult<TicketDto>>(StatusCodes.Status200OK);

        ticketGroup.MapGet("/{id}", async ([FromServices] ITicketService ticketService, string id) =>
            await ticketService.GetTicketByIdAsync(id) is { } ticket ? Results.Ok(ticket) : Results.NotFound(new { message = ApplicationConstants.ErrorMessages.TicketNotFound }))
            .WithName("GetTicketById")
            .Produces<TicketDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        ticketGroup.MapPost("", async ([FromServices] ITicketService ticketService, [FromServices] ILogger<TicketService> logger, [FromBody] CreateTicketRequest request) =>
        {
            if (ValidateRequest(request) is { } error) return error;
            try
            {
                var ticket = await ticketService.CreateTicketAsync(request);
                return Results.Created($"/api/tickets/{ticket.Id}", ticket);
            }
            catch (Exception ex) { return HandleTicketError(ex, logger, "creating ticket"); }
        })
        .WithName("CreateTicket")
        .Produces<TicketDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status500InternalServerError);

        ticketGroup.MapPut("/{id}", async ([FromServices] ITicketService ticketService, [FromServices] ILogger<TicketService> logger, string id, [FromBody] UpdateTicketRequest request) =>
        {
            try
            {
                var ticket = await ticketService.UpdateTicketAsync(id, request);
                return ticket is null ? Results.NotFound(new { message = ApplicationConstants.ErrorMessages.TicketNotFound }) : Results.Ok(ticket);
            }
            catch (Exception ex) { return HandleTicketError(ex, logger, $"updating ticket {id}"); }
        })
        .WithName("UpdateTicket")
        .Produces<TicketDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status500InternalServerError);
    }
}

