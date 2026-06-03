using api.Models;

namespace api.Services;

public interface ITokenService
{
    string CreateToken(User user);

    int GetTokenExpiryMinutes();
}
