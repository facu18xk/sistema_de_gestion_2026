using api.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    [DbContext(typeof(DblosAmigosContext))]
    [Migration("20260529103000_AddEstadoToNotasCreditosVentas")]
    public partial class AddEstadoToNotasCreditosVentas : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id_Estado",
                table: "Notas_Creditos_Ventas",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("""
                DO $$
                DECLARE
                    default_estado_id integer;
                BEGIN
                    INSERT INTO "Estados" ("Nombre")
                    SELECT 'Registrado'
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM "Estados"
                        WHERE "Nombre" = 'Registrado'
                    );

                    SELECT "Id_Estado"
                    INTO default_estado_id
                    FROM "Estados"
                    WHERE "Nombre" = 'Registrado'
                    ORDER BY "Id_Estado"
                    LIMIT 1;

                    UPDATE "Notas_Creditos_Ventas"
                    SET "Id_Estado" = default_estado_id
                    WHERE "Id_Estado" IS NULL;
                END
                $$;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Ventas_Id_Estado",
                table: "Notas_Creditos_Ventas",
                column: "Id_Estado");

            migrationBuilder.AddForeignKey(
                name: "FK_Notas_Creditos_Ventas_Estados",
                table: "Notas_Creditos_Ventas",
                column: "Id_Estado",
                principalTable: "Estados",
                principalColumn: "Id_Estado");

            migrationBuilder.AlterColumn<int>(
                name: "Id_Estado",
                table: "Notas_Creditos_Ventas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notas_Creditos_Ventas_Estados",
                table: "Notas_Creditos_Ventas");

            migrationBuilder.DropIndex(
                name: "IX_Notas_Creditos_Ventas_Id_Estado",
                table: "Notas_Creditos_Ventas");

            migrationBuilder.DropColumn(
                name: "Id_Estado",
                table: "Notas_Creditos_Ventas");
        }
    }
}
