using System.Security.Claims;
using api.Data;
using api.Dtos.Auth;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthController(
        AppDbContext context,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("registrarse")]
    public async Task<ActionResult<AuthResponseDto>> Signup(SignupRequestDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var userExists = await _context.Users.AnyAsync(u => u.Email == email);
        if (userExists)
        {
            return Conflict(new { message = " ya existe un usuario con ese correo" });
        }

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);

        return CreatedAtAction(nameof(Me), new { }, new AuthResponseDto
        {
            Token = token,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_tokenService.GetTokenExpiryMinutes()),
            User = new UserResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            }
        });
    }

    [HttpPost("iniciar")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user is null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Correo o contrasenha invalida" });
        }

        var token = _tokenService.CreateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_tokenService.GetTokenExpiryMinutes()),
            User = new UserResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            }
        });
    }

    [Authorize]
    [HttpGet("yo")]
    public async Task<ActionResult<UserResponseDto>> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email
        });
    }
}