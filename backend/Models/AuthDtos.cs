using System.ComponentModel.DataAnnotations;

namespace DevTask.Api.Models;

public class RegisterRequest
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(160)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;
}

public record RegisterResponse(int Id, string Name, string Email, DateTime CreatedAt);
