namespace Backend.Constants;

public static class ApplicationConstants
{
    public static class TicketStatus
    {
        public const string New = "New";
        public const string InProgress = "In Progress";
        public const string Resolved = "Resolved";
        public const string Closed = "Closed";

        public static readonly string[] AllStatuses = { New, InProgress, Resolved, Closed };
    }

    public static class Pagination
    {
        public const int DefaultPageSize = 20;
        public const int MinPageSize = 1;
        public const int MaxPageSize = 100;
        public const int DefaultPage = 1;
    }

    public static class ValidationLimits
    {
        public const int MaxNameLength = 100;
        public const int MaxEmailLength = 256;
        public const int MaxDescriptionLength = 5000;
        public const int MinNameLength = 1;
        public const int MinDescriptionLength = 10;
    }

    public static class NotificationType
    {
        public const string StatusChanged = "status";
        public const string ResolutionAdded = "resolution";
    }

    public static class ErrorMessages
    {
        public const string TicketNotFound = "Ticket not found";
        public const string NameRequired = "Name is required";
        public const string EmailRequired = "Email is required";
        public const string EmailInvalid = "Invalid email format";
        public const string DescriptionRequired = "Description is required";

        public static string InvalidStatusValue(string status) => $"Invalid status: {status}";
    }

    public static class EmailTemplates
    {
        public const string TicketCreatedSubject = "Support Ticket Created";
        public const string TicketUpdatedSubject = "Support Ticket Updated";

        public static string TicketCreatedBody(string ticketId) =>
            $"Your support ticket has been created.\n\nTicket ID: {ticketId}\n\nWe'll get back to you soon!";

        public static string StatusUpdatedBody(string status, string ticketId) =>
            $"Your ticket status has been updated.\n\nTicket ID: {ticketId}\nNew Status: {status}";

        public static string ResolutionAddedBody(string resolution, string ticketId) =>
            $"Your ticket has been updated with resolution.\n\nTicket ID: {ticketId}\nResolution: {resolution}";
    }

    public static class AiPrompts
    {
        public const string SummarySystemPrompt = @"You analyze support tickets and write short, actionable summaries.
                Identify the main problem, include key technical details and context, note any urgency, a
                nd keep it 2-3 short sentences (max 10 words each). Use clear, simple, professional
                language and focus only on actionable information for support staff.
                Format as a direct factual summary with no preamble.";

        public static string SummaryUserPrompt(string description) =>
            $"Analyze and summarize this support ticket:\n\n{description}";
    }
}
