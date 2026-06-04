using api.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    [DbContext(typeof(DblosAmigosContext))]
    [Migration("20260525152000_MakeNotaCreditoVentaDirectFromFactura")]
    public partial class MakeNotaCreditoVentaDirectFromFactura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notas_Creditos_Ventas_Notas_Devoluciones_Ventas",
                table: "Notas_Creditos_Ventas");

            migrationBuilder.AlterColumn<int>(
                name: "Id_Nota_Devolucion_Venta",
                table: "Notas_Creditos_Ventas",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Notas_Creditos_Ventas_Notas_Devoluciones_Ventas",
                table: "Notas_Creditos_Ventas",
                column: "Id_Nota_Devolucion_Venta",
                principalTable: "Notas_Devoluciones_Ventas",
                principalColumn: "Id_Nota_Devolucion_Venta",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notas_Creditos_Ventas_Notas_Devoluciones_Ventas",
                table: "Notas_Creditos_Ventas");

            migrationBuilder.Sql("""
                DELETE FROM "Notas_Creditos_Ventas"
                WHERE "Id_Nota_Devolucion_Venta" IS NULL
                """);

            migrationBuilder.AlterColumn<int>(
                name: "Id_Nota_Devolucion_Venta",
                table: "Notas_Creditos_Ventas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Notas_Creditos_Ventas_Notas_Devoluciones_Ventas",
                table: "Notas_Creditos_Ventas",
                column: "Id_Nota_Devolucion_Venta",
                principalTable: "Notas_Devoluciones_Ventas",
                principalColumn: "Id_Nota_Devolucion_Venta");
        }
    }
}
