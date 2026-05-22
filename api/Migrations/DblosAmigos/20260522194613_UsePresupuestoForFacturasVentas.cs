using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class UsePresupuestoForFacturasVentas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Facturas_Ventas_Ordenes_Ventas",
                table: "Facturas_Ventas");

            migrationBuilder.AddColumn<int>(
                name: "Id_Presupuesto",
                table: "Facturas_Ventas",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "Facturas_Ventas" AS factura
                SET "Id_Presupuesto" = orden."Id_Presupuesto"
                FROM "Ordenes_Ventas" AS orden
                WHERE factura."Id_Orden_Venta" = orden."Id_Orden_Venta";
                """);

            migrationBuilder.AlterColumn<int>(
                name: "Id_Presupuesto",
                table: "Facturas_Ventas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.DropIndex(
                name: "IX_Facturas_Ventas_Id_Orden_Venta",
                table: "Facturas_Ventas");

            migrationBuilder.DropColumn(
                name: "Id_Orden_Venta",
                table: "Facturas_Ventas");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Id_Presupuesto",
                table: "Facturas_Ventas",
                column: "Id_Presupuesto");

            migrationBuilder.AddForeignKey(
                name: "FK_Facturas_Ventas_Presupuestos",
                table: "Facturas_Ventas",
                column: "Id_Presupuesto",
                principalTable: "Presupuestos",
                principalColumn: "Id_Presupuesto");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Facturas_Ventas_Presupuestos",
                table: "Facturas_Ventas");

            migrationBuilder.AddColumn<int>(
                name: "Id_Orden_Venta",
                table: "Facturas_Ventas",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "Facturas_Ventas" AS factura
                SET "Id_Orden_Venta" = orden."Id_Orden_Venta"
                FROM (
                    SELECT DISTINCT ON ("Id_Presupuesto") "Id_Presupuesto", "Id_Orden_Venta"
                    FROM "Ordenes_Ventas"
                    ORDER BY "Id_Presupuesto", "Id_Orden_Venta"
                ) AS orden
                WHERE factura."Id_Presupuesto" = orden."Id_Presupuesto";
                """);

            migrationBuilder.AlterColumn<int>(
                name: "Id_Orden_Venta",
                table: "Facturas_Ventas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.DropIndex(
                name: "IX_Facturas_Ventas_Id_Presupuesto",
                table: "Facturas_Ventas");

            migrationBuilder.DropColumn(
                name: "Id_Presupuesto",
                table: "Facturas_Ventas");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Id_Orden_Venta",
                table: "Facturas_Ventas",
                column: "Id_Orden_Venta");

            migrationBuilder.AddForeignKey(
                name: "FK_Facturas_Ventas_Ordenes_Ventas",
                table: "Facturas_Ventas",
                column: "Id_Orden_Venta",
                principalTable: "Ordenes_Ventas",
                principalColumn: "Id_Orden_Venta");
        }
    }
}
