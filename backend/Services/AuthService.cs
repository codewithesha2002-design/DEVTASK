using System.Security.Cryptography;
using DevTask.Api.Data;
using DevTask.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevTask.Api.Services;

public class AuthService(DevTaskDbContext dbContext) : IAuthService
{
    public Task<bool> EmailExistsAsync(string email) =>
        dbContext.Users.AnyAsync(user => user.Email == email.Trim().ToLowerInvariant());

    public async Task<RegisterResponse?> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await EmailExistsAsync(email)) return null;

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        return new RegisterResponse(user.Id, user.Name, user.Email, user.CreatedAt);
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return $"100000.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }
}
