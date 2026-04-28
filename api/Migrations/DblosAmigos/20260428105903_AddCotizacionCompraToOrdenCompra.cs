using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class AddCotizacionCompraToOrdenCompra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id_Cotizacion_Compra",
                table: "Ordenes_Compras",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Compras_Id_Cotizacion_Compra",
                table: "Ordenes_Compras",
                column: "Id_Cotizacion_Compra");

            migrationBuilder.AddForeignKey(
                name: "FK_Ordenes_Compras_Cotizaciones_Compras",
                table: "Ordenes_Compras",
                column: "Id_Cotizacion_Compra",
                principalTable: "Cotizaciones_Compras",
                principalColumn: "Id_Cotizacion_Compra");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ordenes_Compras_Cotizaciones_Compras",
                table: "Ordenes_Compras");

            migrationBuilder.DropIndex(
                name: "IX_Ordenes_Compras_Id_Cotizacion_Compra",
                table: "Ordenes_Compras");

            migrationBuilder.DropColumn(
                name: "Id_Cotizacion_Compra",
                table: "Ordenes_Compras");
        }
    }
}
