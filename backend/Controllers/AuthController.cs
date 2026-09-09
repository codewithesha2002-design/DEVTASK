using DevTask.Api.Models;
using DevTask.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevTask.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request)
    {
        if (await authService.EmailExistsAsync(request.Email))
        {
            return Conflict(new { message = "An account with this email already exists." });
        }

        var response = await authService.RegisterAsync(request);
        return Created("/api/auth/register", response);
    }
}
