using System.ComponentModel.DataAnnotations;
using Backend.Constants;

namespace Backend.Models.DTOs;

public class CreateTicketRequest
{
    [Required(ErrorMessage = ApplicationConstants.ErrorMessages.NameRequired)]
    [StringLength(
        ApplicationConstants.ValidationLimits.MaxNameLength,
        MinimumLength = ApplicationConstants.ValidationLimits.MinNameLength)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = ApplicationConstants.ErrorMessages.EmailRequired)]
    [EmailAddress(ErrorMessage = ApplicationConstants.ErrorMessages.EmailInvalid)]
    [MaxLength(ApplicationConstants.ValidationLimits.MaxEmailLength)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = ApplicationConstants.ErrorMessages.DescriptionRequired)]
    [StringLength(
        ApplicationConstants.ValidationLimits.MaxDescriptionLength,
        MinimumLength = ApplicationConstants.ValidationLimits.MinDescriptionLength)]
    public string Description { get; set; } = string.Empty;
}
