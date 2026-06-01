using api.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    [DbContext(typeof(DblosAmigosContext))]
    [Migration("20260601213000_AddNroComprobanteNotasCreditosVentas")]
    public partial class AddNroComprobanteNotasCreditosVentas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Nro_Comprobante",
                table: "Notas_Creditos_Ventas",
                type: "character varying(100)",
                unicode: false,
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Nro_Comprobante",
                table: "Notas_Creditos_Ventas");
        }
    }
}
