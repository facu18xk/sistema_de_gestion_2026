using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class AddProveedorCategorias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id_Categoria",
                table: "Productos_Proveedores",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id_Categoria",
                table: "Pedidos_Cotizaciones_Detalles",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id_Categoria",
                table: "Pedidos_Compras_Detalles",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "Productos_Proveedores" pp
                SET "Id_Categoria" = p."Id_Categoria"
                FROM "Productos" p
                WHERE pp."Id_Producto" = p."Id_Producto";
                """);

            migrationBuilder.Sql("""
                UPDATE "Pedidos_Cotizaciones_Detalles" pcd
                SET "Id_Categoria" = p."Id_Categoria"
                FROM "Productos" p
                WHERE pcd."Id_Producto" = p."Id_Producto";
                """);

            migrationBuilder.Sql("""
                UPDATE "Pedidos_Compras_Detalles" pcd
                SET "Id_Categoria" = p."Id_Categoria"
                FROM "Productos" p
                WHERE pcd."Id_Producto" = p."Id_Producto";
                """);

            migrationBuilder.AlterColumn<int>(
                name: "Id_Categoria",
                table: "Productos_Proveedores",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id_Categoria",
                table: "Pedidos_Cotizaciones_Detalles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id_Categoria",
                table: "Pedidos_Compras_Detalles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Pedidos_Cotizaciones_Detalles");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Pedidos_Compras_Detalles");

            migrationBuilder.CreateTable(
                name: "Categorias_Proveedores",
                columns: table => new
                {
                    Id_Proveedor = table.Column<int>(type: "integer", nullable: false),
                    Id_Categoria = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias_Proveedores", x => new { x.Id_Proveedor, x.Id_Categoria });
                    table.ForeignKey(
                        name: "FK_Categorias_Proveedores_Categorias",
                        column: x => x.Id_Categoria,
                        principalTable: "Categorias",
                        principalColumn: "Id_Categoria");
                    table.ForeignKey(
                        name: "FK_Categorias_Proveedores_Proveedores",
                        column: x => x.Id_Proveedor,
                        principalTable: "Proveedores",
                        principalColumn: "Id_Proveedor");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Proveedores_Id_Categoria",
                table: "Productos_Proveedores",
                column: "Id_Categoria");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Cotizaciones_Detalles_Id_Categoria",
                table: "Pedidos_Cotizaciones_Detalles",
                column: "Id_Categoria");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Compras_Detalles_Id_Categoria",
                table: "Pedidos_Compras_Detalles",
                column: "Id_Categoria");

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_Proveedores_Id_Categoria",
                table: "Categorias_Proveedores",
                column: "Id_Categoria");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Compras_Detalles_Categorias",
                table: "Pedidos_Compras_Detalles",
                column: "Id_Categoria",
                principalTable: "Categorias",
                principalColumn: "Id_Categoria");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Cotizaciones_Detalles_Categorias",
                table: "Pedidos_Cotizaciones_Detalles",
                column: "Id_Categoria",
                principalTable: "Categorias",
                principalColumn: "Id_Categoria");

            migrationBuilder.AddForeignKey(
                name: "FK_Productos_Proveedores_Categorias",
                table: "Productos_Proveedores",
                column: "Id_Categoria",
                principalTable: "Categorias",
                principalColumn: "Id_Categoria");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Compras_Detalles_Categorias",
                table: "Pedidos_Compras_Detalles");

            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Cotizaciones_Detalles_Categorias",
                table: "Pedidos_Cotizaciones_Detalles");

            migrationBuilder.DropForeignKey(
                name: "FK_Productos_Proveedores_Categorias",
                table: "Productos_Proveedores");

            migrationBuilder.DropTable(
                name: "Categorias_Proveedores");

            migrationBuilder.DropIndex(
                name: "IX_Productos_Proveedores_Id_Categoria",
                table: "Productos_Proveedores");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_Cotizaciones_Detalles_Id_Categoria",
                table: "Pedidos_Cotizaciones_Detalles");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_Compras_Detalles_Id_Categoria",
                table: "Pedidos_Compras_Detalles");

            migrationBuilder.DropColumn(
                name: "Id_Categoria",
                table: "Productos_Proveedores");

            migrationBuilder.DropColumn(
                name: "Id_Categoria",
                table: "Pedidos_Cotizaciones_Detalles");

            migrationBuilder.DropColumn(
                name: "Id_Categoria",
                table: "Pedidos_Compras_Detalles");

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Pedidos_Cotizaciones_Detalles",
                type: "character varying(100)",
                unicode: false,
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Pedidos_Compras_Detalles",
                type: "character varying(100)",
                unicode: false,
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
