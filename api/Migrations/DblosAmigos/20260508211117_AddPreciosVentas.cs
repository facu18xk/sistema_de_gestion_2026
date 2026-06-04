using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class AddPreciosVentas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Precio_Unitario",
                table: "Presupuestos_Detalles",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Precio_Unitario",
                table: "Ordenes_Ventas_Detalles",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Precios_Ventas",
                columns: table => new
                {
                    Id_Precio_Venta = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Precio_Compra_Base = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Porcentaje_Ganancia = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Precio_Venta = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Fecha_Desde = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Fecha_Hasta = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Precios_Ventas", x => x.Id_Precio_Venta);
                    table.ForeignKey(
                        name: "FK_Precios_Ventas_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Precios_Ventas_Id_Producto_Activo",
                table: "Precios_Ventas",
                column: "Id_Producto",
                unique: true,
                filter: "\"Activo\" = TRUE");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Precios_Ventas");

            migrationBuilder.DropColumn(
                name: "Precio_Unitario",
                table: "Presupuestos_Detalles");

            migrationBuilder.DropColumn(
                name: "Precio_Unitario",
                table: "Ordenes_Ventas_Detalles");
        }
    }
}
