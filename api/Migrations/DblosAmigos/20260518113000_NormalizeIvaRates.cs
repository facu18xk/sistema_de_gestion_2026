using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class NormalizeIvaRates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Productos"
                SET "Porcentaje_IVA" = ROUND("Porcentaje_IVA" / 100, 2)
                WHERE "Porcentaje_IVA" > 1;
                """);

            migrationBuilder.Sql("""
                UPDATE "Presupuestos_Detalles" AS detalle
                SET "IVA" = producto."Porcentaje_IVA"
                FROM "Productos" AS producto
                WHERE detalle."Id_Producto" = producto."Id_Producto"
                  AND detalle."IVA" IS DISTINCT FROM producto."Porcentaje_IVA";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
