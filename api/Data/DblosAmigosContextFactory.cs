using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace api.Data;

public class DblosAmigosContextFactory : IDesignTimeDbContextFactory<DblosAmigosContext>
{
    public DblosAmigosContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not found. Configure it in appsettings or environment variables.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<DblosAmigosContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new DblosAmigosContext(optionsBuilder.Options);
    }
}
