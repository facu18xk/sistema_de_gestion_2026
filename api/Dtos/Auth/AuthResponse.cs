namespace api.Dtos.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public UserResponseDto User { get; set; } = new();
}