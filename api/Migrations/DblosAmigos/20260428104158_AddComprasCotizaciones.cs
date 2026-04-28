using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class AddComprasCotizaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cotizaciones_Compras",
                columns: table => new
                {
                    Id_Cotizacion_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Solicitud_Cotizacion = table.Column<int>(type: "integer", nullable: false),
                    Id_Proveedor = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Valida_Hasta = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Id_Estado = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cotizaciones_Compras", x => x.Id_Cotizacion_Compra);
                    table.ForeignKey(
                        name: "FK_Cotizaciones_Compras_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                    table.ForeignKey(
                        name: "FK_Cotizaciones_Compras_Pedidos_Cotizaciones",
                        column: x => x.Id_Solicitud_Cotizacion,
                        principalTable: "Pedidos_Cotizaciones",
                        principalColumn: "Id_Pedido_Cotizacion");
                    table.ForeignKey(
                        name: "FK_Cotizaciones_Compras_Proveedores",
                        column: x => x.Id_Proveedor,
                        principalTable: "Proveedores",
                        principalColumn: "Id_Proveedor");
                });

            migrationBuilder.CreateTable(
                name: "Productos_Proveedores",
                columns: table => new
                {
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Id_Proveedor = table.Column<int>(type: "integer", nullable: false),
                    Codigo_Proveedor = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos_Proveedores", x => new { x.Id_Producto, x.Id_Proveedor });
                    table.ForeignKey(
                        name: "FK_Productos_Proveedores_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                    table.ForeignKey(
                        name: "FK_Productos_Proveedores_Proveedores",
                        column: x => x.Id_Proveedor,
                        principalTable: "Proveedores",
                        principalColumn: "Id_Proveedor");
                });

            migrationBuilder.CreateTable(
                name: "Cotizaciones_Compras_Detalles",
                columns: table => new
                {
                    Id_Cotizacion_Compra_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Cotizacion_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Descuento = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cotizaciones_Compras_Detalles", x => x.Id_Cotizacion_Compra_Detalle);
                    table.ForeignKey(
                        name: "FK_Cotizaciones_Compras_Detalles_Cotizaciones_Compras",
                        column: x => x.Id_Cotizacion_Compra,
                        principalTable: "Cotizaciones_Compras",
                        principalColumn: "Id_Cotizacion_Compra");
                    table.ForeignKey(
                        name: "FK_Cotizaciones_Compras_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cotizaciones_Compras_Id_Estado",
                table: "Cotizaciones_Compras",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Cotizaciones_Compras_Id_Proveedor",
                table: "Cotizaciones_Compras",
                column: "Id_Proveedor");

            migrationBuilder.CreateIndex(
                name: "IX_Cotizaciones_Compras_Id_Solicitud_Cotizacion",
                table: "Cotizaciones_Compras",
                column: "Id_Solicitud_Cotizacion");

            migrationBuilder.CreateIndex(
                name: "IX_Cotizaciones_Compras_Detalles_Id_Cotizacion_Compra",
                table: "Cotizaciones_Compras_Detalles",
                column: "Id_Cotizacion_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Cotizaciones_Compras_Detalles_Id_Producto",
                table: "Cotizaciones_Compras_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Proveedores_Id_Proveedor",
                table: "Productos_Proveedores",
                column: "Id_Proveedor");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cotizaciones_Compras_Detalles");

            migrationBuilder.DropTable(
                name: "Productos_Proveedores");

            migrationBuilder.DropTable(
                name: "Cotizaciones_Compras");
        }
    }
}
