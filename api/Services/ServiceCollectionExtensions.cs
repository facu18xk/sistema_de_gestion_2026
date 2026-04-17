using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace api.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCrudServicesFromAssembly(
        this IServiceCollection services,
        Assembly assembly)
    {
        var serviceTypes = assembly
            .DefinedTypes
            .Where(type => !type.IsAbstract && !type.IsInterface)
            .Select(type => new
            {
                Implementation = type.AsType(),
                ServiceInterfaces = type.ImplementedInterfaces
                    .Where(interfaceType =>
                        interfaceType.IsGenericType &&
                        (interfaceType.GetGenericTypeDefinition() == typeof(ICrudService<,>) ||
                         interfaceType.GetGenericTypeDefinition() == typeof(ICompositeCrudService<,,>)))
                    .ToList()
            })
            .Where(item => item.ServiceInterfaces.Count > 0);

        foreach (var serviceType in serviceTypes)
        {
            foreach (var serviceInterface in serviceType.ServiceInterfaces)
            {
                services.AddScoped(serviceInterface, serviceType.Implementation);
            }
        }

        return services;
    }
}
