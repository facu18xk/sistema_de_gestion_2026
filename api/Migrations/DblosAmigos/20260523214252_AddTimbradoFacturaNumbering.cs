using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class AddTimbradoFacturaNumbering : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Timbrados",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Establecimiento",
                table: "Timbrados",
                type: "character varying(3)",
                unicode: false,
                maxLength: 3,
                nullable: false,
                defaultValue: "001");

            migrationBuilder.AddColumn<int>(
                name: "Numero_Final",
                table: "Timbrados",
                type: "integer",
                nullable: false,
                defaultValue: 9999999);

            migrationBuilder.AddColumn<int>(
                name: "Numero_Inicial",
                table: "Timbrados",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "Numero_Timbrado",
                table: "Timbrados",
                type: "character varying(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Punto_Expedicion",
                table: "Timbrados",
                type: "character varying(3)",
                unicode: false,
                maxLength: 3,
                nullable: false,
                defaultValue: "001");

            migrationBuilder.AddColumn<string>(
                name: "Tipo_Comprobante",
                table: "Timbrados",
                type: "character varying(50)",
                unicode: false,
                maxLength: 50,
                nullable: false,
                defaultValue: "Factura");

            migrationBuilder.AddColumn<int>(
                name: "Ultimo_Numero_Usado",
                table: "Timbrados",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                UPDATE "Timbrados"
                SET "Establecimiento" = '001',
                    "Punto_Expedicion" = '001',
                    "Numero_Inicial" = 1,
                    "Numero_Final" = 9999999,
                    "Tipo_Comprobante" = 'Factura',
                    "Activo" = TRUE,
                    "Numero_Timbrado" = COALESCE(NULLIF("RUC", ''), "Id_Timbrado"::text);
                """);

            migrationBuilder.Sql("""
                WITH usados AS (
                    SELECT
                        "Id_Timbrado",
                        MAX(substring("Nro_Comprobante" from '([0-9]{1,7})$')::integer) AS ultimo
                    FROM "Facturas_Ventas"
                    WHERE "Nro_Comprobante" ~ '[0-9]{1,7}$'
                    GROUP BY "Id_Timbrado"
                )
                UPDATE "Timbrados" AS timbrado
                SET "Ultimo_Numero_Usado" = GREATEST(timbrado."Ultimo_Numero_Usado", COALESCE(usados.ultimo, 0))
                FROM usados
                WHERE timbrado."Id_Timbrado" = usados."Id_Timbrado";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Timbrados");

            migrationBuilder.DropColumn(
                name: "Establecimiento",
                table: "Timbrados");

            migrationBuilder.DropColumn(
                name: "Numero_Final",
                table: "Timbrados");

            migrationBuilder.DropColumn(
                name: "Numero_Inicial",
                table: "Timbrados");

            migrationBuilder.DropColumn(
                name: "Numero_Timbrado",
                table: "Timbrados");

            migrationBuilder.DropColumn(
                name: "Punto_Expedicion",
                table: "Timbrados");

            migrationBuilder.DropColumn(
                name: "Tipo_Comprobante",
                table: "Timbrados");

            migrationBuilder.DropColumn(
                name: "Ultimo_Numero_Usado",
                table: "Timbrados");
        }
    }
}
