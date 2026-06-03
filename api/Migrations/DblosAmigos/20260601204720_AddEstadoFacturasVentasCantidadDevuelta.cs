using api.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    [DbContext(typeof(DblosAmigosContext))]
    [Migration("20260601204720_AddEstadoFacturasVentasCantidadDevuelta")]
    public partial class AddEstadoFacturasVentasCantidadDevuelta : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Cantidad_Devuelta",
                table: "Facturas_Ventas_Detalles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Id_Estado",
                table: "Facturas_Ventas",
                type: "integer",
                nullable: false,
                defaultValue: 7);

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Id_Estado",
                table: "Facturas_Ventas",
                column: "Id_Estado");

            migrationBuilder.AddForeignKey(
                name: "FK_Facturas_Ventas_Estados",
                table: "Facturas_Ventas",
                column: "Id_Estado",
                principalTable: "Estados",
                principalColumn: "Id_Estado");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Facturas_Ventas_Estados",
                table: "Facturas_Ventas");

            migrationBuilder.DropIndex(
                name: "IX_Facturas_Ventas_Id_Estado",
                table: "Facturas_Ventas");

            migrationBuilder.DropColumn(
                name: "Cantidad_Devuelta",
                table: "Facturas_Ventas_Detalles");

            migrationBuilder.DropColumn(
                name: "Id_Estado",
                table: "Facturas_Ventas");
        }
    }
}
