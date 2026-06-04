using System;
using api.Models;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    [DbContext(typeof(DblosAmigosContext))]
    [Migration("20260604120000_AddRrhhSalarios")]
    public partial class AddRrhhSalarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Parientes" ADD COLUMN IF NOT EXISTS "Nombre" text NOT NULL DEFAULT '';
                ALTER TABLE "Parientes" ADD COLUMN IF NOT EXISTS "Apellido" text NOT NULL DEFAULT '';
                ALTER TABLE "Parientes" ADD COLUMN IF NOT EXISTS "CI" text NOT NULL DEFAULT '';
                """);

            migrationBuilder.CreateTable(
                name: "Cargos",
                columns: table => new
                {
                    Id_Cargo = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(120)", unicode: false, maxLength: 120, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cargos", x => x.Id_Cargo);
                });

            migrationBuilder.CreateTable(
                name: "Conceptos_Salarios",
                columns: table => new
                {
                    Id_Concepto_Salario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(160)", unicode: false, maxLength: 160, nullable: false),
                    Tipo = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false),
                    Deducible_IPS = table.Column<bool>(type: "boolean", nullable: false),
                    Es_Salario_Base = table.Column<bool>(type: "boolean", nullable: false),
                    Es_IPS = table.Column<bool>(type: "boolean", nullable: false),
                    Es_Bonificacion_Familiar = table.Column<bool>(type: "boolean", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conceptos_Salarios", x => x.Id_Concepto_Salario);
                });

            migrationBuilder.CreateTable(
                name: "Parametros_Salarios",
                columns: table => new
                {
                    Id_Parametro_Salario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Fecha_Desde = table.Column<DateOnly>(type: "date", nullable: false),
                    Fecha_Hasta = table.Column<DateOnly>(type: "date", nullable: true),
                    Salario_Minimo = table.Column<decimal>(type: "decimal(18, 2)", nullable: false),
                    Porcentaje_IPS_Empleado = table.Column<decimal>(type: "decimal(9, 4)", nullable: false),
                    Porcentaje_Bonificacion_Familiar = table.Column<decimal>(type: "decimal(9, 4)", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parametros_Salarios", x => x.Id_Parametro_Salario);
                });

            migrationBuilder.CreateTable(
                name: "Procesos_Pagos_Salarios",
                columns: table => new
                {
                    Id_Proceso_Pago_Salario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Periodo_Anho = table.Column<int>(type: "integer", nullable: false),
                    Periodo_Mes = table.Column<int>(type: "integer", nullable: false),
                    Fecha_Pago = table.Column<DateOnly>(type: "date", nullable: false),
                    Estado = table.Column<string>(type: "character varying(30)", unicode: false, maxLength: 30, nullable: false),
                    Id_Asiento = table.Column<int>(type: "integer", nullable: true),
                    Created_At = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Cerrado_At = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Procesos_Pagos_Salarios", x => x.Id_Proceso_Pago_Salario);
                    table.ForeignKey(
                        name: "FK_Procesos_Pagos_Salarios_Asientos",
                        column: x => x.Id_Asiento,
                        principalTable: "asientos",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Empleados_Cargos",
                columns: table => new
                {
                    Id_Empleado_Cargo = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Empleado = table.Column<int>(type: "integer", nullable: false),
                    Id_Cargo = table.Column<int>(type: "integer", nullable: false),
                    Fecha_Desde = table.Column<DateOnly>(type: "date", nullable: false),
                    Fecha_Hasta = table.Column<DateOnly>(type: "date", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleados_Cargos", x => x.Id_Empleado_Cargo);
                    table.ForeignKey(
                        name: "FK_Empleados_Cargos_Cargos",
                        column: x => x.Id_Cargo,
                        principalTable: "Cargos",
                        principalColumn: "Id_Cargo");
                    table.ForeignKey(
                        name: "FK_Empleados_Cargos_Empleados",
                        column: x => x.Id_Empleado,
                        principalTable: "Empleados",
                        principalColumn: "Id_Empleado");
                });

            migrationBuilder.CreateTable(
                name: "Empleados_Conceptos_Mensuales",
                columns: table => new
                {
                    Id_Empleado_Concepto_Mensual = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Empleado = table.Column<int>(type: "integer", nullable: false),
                    Id_Concepto_Salario = table.Column<int>(type: "integer", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18, 2)", nullable: false),
                    Fecha_Desde = table.Column<DateOnly>(type: "date", nullable: false),
                    Fecha_Hasta = table.Column<DateOnly>(type: "date", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleados_Conceptos_Mensuales", x => x.Id_Empleado_Concepto_Mensual);
                    table.ForeignKey(
                        name: "FK_Empleados_Conceptos_Mensuales_Conceptos_Salarios",
                        column: x => x.Id_Concepto_Salario,
                        principalTable: "Conceptos_Salarios",
                        principalColumn: "Id_Concepto_Salario");
                    table.ForeignKey(
                        name: "FK_Empleados_Conceptos_Mensuales_Empleados",
                        column: x => x.Id_Empleado,
                        principalTable: "Empleados",
                        principalColumn: "Id_Empleado");
                });

            migrationBuilder.CreateTable(
                name: "Pagos_Salarios_Detalles",
                columns: table => new
                {
                    Id_Pago_Salario_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Proceso_Pago_Salario = table.Column<int>(type: "integer", nullable: false),
                    Id_Empleado = table.Column<int>(type: "integer", nullable: false),
                    Id_Concepto_Salario = table.Column<int>(type: "integer", nullable: false),
                    Tipo = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18, 2)", nullable: false),
                    Deducible_IPS = table.Column<bool>(type: "boolean", nullable: false),
                    Es_Automatico = table.Column<bool>(type: "boolean", nullable: false),
                    Observacion = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos_Salarios_Detalles", x => x.Id_Pago_Salario_Detalle);
                    table.ForeignKey(
                        name: "FK_Pagos_Salarios_Detalles_Conceptos_Salarios",
                        column: x => x.Id_Concepto_Salario,
                        principalTable: "Conceptos_Salarios",
                        principalColumn: "Id_Concepto_Salario");
                    table.ForeignKey(
                        name: "FK_Pagos_Salarios_Detalles_Empleados",
                        column: x => x.Id_Empleado,
                        principalTable: "Empleados",
                        principalColumn: "Id_Empleado");
                    table.ForeignKey(
                        name: "FK_Pagos_Salarios_Detalles_Procesos_Pagos_Salarios",
                        column: x => x.Id_Proceso_Pago_Salario,
                        principalTable: "Procesos_Pagos_Salarios",
                        principalColumn: "Id_Proceso_Pago_Salario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Conceptos_Salarios",
                columns: new[] { "Id_Concepto_Salario", "Activo", "Codigo", "Deducible_IPS", "Descripcion", "Es_Bonificacion_Familiar", "Es_IPS", "Es_Salario_Base", "Tipo" },
                columnTypes: new[] { "integer", "boolean", "character varying(50)", "boolean", "character varying(160)", "boolean", "boolean", "boolean", "character varying(20)" },
                values: new object[,]
                {
                    { 1, true, "SALARIO", true, "Salario", false, false, true, "Ingreso" },
                    { 2, true, "IPS", false, "Descuento IPS", false, true, false, "Egreso" },
                    { 3, true, "BONIFICACION_FAMILIAR", false, "Bonificacion familiar", true, false, false, "Ingreso" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cargos_Nombre",
                table: "Cargos",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conceptos_Salarios_Codigo",
                table: "Conceptos_Salarios",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_Cargos_Cargo",
                table: "Empleados_Cargos",
                column: "Id_Cargo");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_Cargos_Empleado_Activo",
                table: "Empleados_Cargos",
                column: "Id_Empleado",
                unique: true,
                filter: "\"Activo\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_Conceptos_Mensuales_Concepto",
                table: "Empleados_Conceptos_Mensuales",
                column: "Id_Concepto_Salario");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_Conceptos_Mensuales_Empleado_Concepto_Activo",
                table: "Empleados_Conceptos_Mensuales",
                columns: new[] { "Id_Empleado", "Id_Concepto_Salario", "Activo" });

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_Salarios_Detalles_Concepto",
                table: "Pagos_Salarios_Detalles",
                column: "Id_Concepto_Salario");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_Salarios_Detalles_Empleado",
                table: "Pagos_Salarios_Detalles",
                column: "Id_Empleado");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_Salarios_Detalles_Proceso_Empleado",
                table: "Pagos_Salarios_Detalles",
                columns: new[] { "Id_Proceso_Pago_Salario", "Id_Empleado" });

            migrationBuilder.CreateIndex(
                name: "IX_Procesos_Pagos_Salarios_Asiento",
                table: "Procesos_Pagos_Salarios",
                column: "Id_Asiento");

            migrationBuilder.CreateIndex(
                name: "IX_Procesos_Pagos_Salarios_Periodo",
                table: "Procesos_Pagos_Salarios",
                columns: new[] { "Periodo_Anho", "Periodo_Mes" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Empleados_Cargos");
            migrationBuilder.DropTable(name: "Empleados_Conceptos_Mensuales");
            migrationBuilder.DropTable(name: "Pagos_Salarios_Detalles");
            migrationBuilder.DropTable(name: "Parametros_Salarios");
            migrationBuilder.DropTable(name: "Cargos");
            migrationBuilder.DropTable(name: "Conceptos_Salarios");
            migrationBuilder.DropTable(name: "Procesos_Pagos_Salarios");

            migrationBuilder.DropColumn(name: "Nombre", table: "Parientes");
            migrationBuilder.DropColumn(name: "Apellido", table: "Parientes");
            migrationBuilder.DropColumn(name: "CI", table: "Parientes");
        }
    }
}
