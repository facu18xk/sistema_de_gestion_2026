using api.Models;
using Microsoft.AspNetCore.Identity;

namespace api.Services;

public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public string HashPassword(string password)
    {
        return _passwordHasher.HashPassword(user: null!, password);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        var result = _passwordHasher.VerifyHashedPassword(user: null!, passwordHash, password);
        return result is PasswordVerificationResult.Success
            or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
