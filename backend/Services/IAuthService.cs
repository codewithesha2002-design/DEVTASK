using DevTask.Api.Models;

namespace DevTask.Api.Services;

public interface IAuthService
{
    Task<RegisterResponse?> RegisterAsync(RegisterRequest request);
    Task<bool> EmailExistsAsync(string email);
}
