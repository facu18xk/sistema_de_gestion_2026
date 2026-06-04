using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class RemoveFechaPagoFromChequesEmitidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fecha_Pago",
                table: "Cheques_Emitidos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Fecha_Pago",
                table: "Cheques_Emitidos",
                type: "timestamp without time zone",
                nullable: true);
        }
    }
}
