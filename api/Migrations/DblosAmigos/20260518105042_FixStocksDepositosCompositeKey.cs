using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class FixStocksDepositosCompositeKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Stocks_Depositos",
                table: "Stocks_Depositos");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Stocks_Depositos",
                table: "Stocks_Depositos",
                columns: new[] { "Id_Deposito", "Id_Producto" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Stocks_Depositos",
                table: "Stocks_Depositos");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Stocks_Depositos",
                table: "Stocks_Depositos",
                column: "Id_Deposito");
        }
    }
}
