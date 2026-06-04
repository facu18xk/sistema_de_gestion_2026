namespace api.Services;

public static class ContabilidadEstados
{
    public const string Habilitado = "Habilitado";
    public const string Abierto = "Abierto";
    public const string Activo = "Activo";
    public const string Activa = "Activa";
    public const string Registrado = "Registrado";
    public const string Registrada = "Registrada";

    public static readonly string[] EstadosHabilitados =
    {
        Habilitado,
        Abierto,
        Activo,
        Activa,
        Registrado,
        Registrada
    };
}
