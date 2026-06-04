using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class AddTesoreriaBancos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bancos",
                columns: table => new
                {
                    Id_Banco = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(120)", unicode: false, maxLength: 120, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bancos", x => x.Id_Banco);
                });

            migrationBuilder.CreateTable(
                name: "Tipos_Cuentas_Bancarias",
                columns: table => new
                {
                    Id_Tipo_Cuenta_Bancaria = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tipos_Cuentas_Bancarias", x => x.Id_Tipo_Cuenta_Bancaria);
                });

            migrationBuilder.CreateTable(
                name: "Tipos_Depositos_Bancarios",
                columns: table => new
                {
                    Id_Tipo_Deposito_Bancario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tipos_Depositos_Bancarios", x => x.Id_Tipo_Deposito_Bancario);
                });

            migrationBuilder.CreateTable(
                name: "Tipos_Movimientos_Bancarios",
                columns: table => new
                {
                    Id_Tipo_Movimiento_Bancario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(40)", unicode: false, maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tipos_Movimientos_Bancarios", x => x.Id_Tipo_Movimiento_Bancario);
                });

            migrationBuilder.CreateTable(
                name: "Cuentas_Bancarias",
                columns: table => new
                {
                    Id_Cuenta_Bancaria = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Banco = table.Column<int>(type: "integer", nullable: false),
                    Id_Tipo_Cuenta_Bancaria = table.Column<int>(type: "integer", nullable: false),
                    Id_Cuenta_Contable = table.Column<int>(type: "integer", nullable: true),
                    Numero_Cuenta = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: false),
                    Moneda = table.Column<string>(type: "character varying(10)", unicode: false, maxLength: 10, nullable: false, defaultValue: "PYG"),
                    Saldo = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Saldo_Disponible = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Activa = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuentas_Bancarias", x => x.Id_Cuenta_Bancaria);
                    table.ForeignKey(
                        name: "FK_Cuentas_Bancarias_Bancos",
                        column: x => x.Id_Banco,
                        principalTable: "Bancos",
                        principalColumn: "Id_Banco");
                    table.ForeignKey(
                        name: "FK_Cuentas_Bancarias_Cuentas_Contables",
                        column: x => x.Id_Cuenta_Contable,
                        principalTable: "cuentas_contables",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_Cuentas_Bancarias_Tipos_Cuentas_Bancarias",
                        column: x => x.Id_Tipo_Cuenta_Bancaria,
                        principalTable: "Tipos_Cuentas_Bancarias",
                        principalColumn: "Id_Tipo_Cuenta_Bancaria");
                });

            migrationBuilder.CreateTable(
                name: "Cheques_Emitidos",
                columns: table => new
                {
                    Id_Cheque_Emitido = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Cuenta_Bancaria = table.Column<int>(type: "integer", nullable: false),
                    Id_Orden_Medio_Pago_Compra = table.Column<int>(type: "integer", nullable: true),
                    Id_Movimiento_Bancario = table.Column<int>(type: "integer", nullable: true),
                    Numero_Cheque = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: false),
                    Beneficiario = table.Column<string>(type: "character varying(180)", unicode: false, maxLength: 180, nullable: false),
                    Fecha_Emision = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Fecha_Pago = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Estado = table.Column<string>(type: "character varying(40)", unicode: false, maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cheques_Emitidos", x => x.Id_Cheque_Emitido);
                    table.ForeignKey(
                        name: "FK_Cheques_Emitidos_Cuentas_Bancarias",
                        column: x => x.Id_Cuenta_Bancaria,
                        principalTable: "Cuentas_Bancarias",
                        principalColumn: "Id_Cuenta_Bancaria");
                    table.ForeignKey(
                        name: "FK_Cheques_Emitidos_Ordenes_Medios_Pagos_Compras",
                        column: x => x.Id_Orden_Medio_Pago_Compra,
                        principalTable: "Ordenes_Medios_Pagos_Compras",
                        principalColumn: "Id_Orden_Medio_Pago_Compra");
                });

            migrationBuilder.CreateTable(
                name: "Movimientos_Bancarios",
                columns: table => new
                {
                    Id_Movimiento_Bancario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Cuenta_Bancaria = table.Column<int>(type: "integer", nullable: false),
                    Id_Tipo_Movimiento_Bancario = table.Column<int>(type: "integer", nullable: false),
                    Id_Estado = table.Column<int>(type: "integer", nullable: true),
                    Id_Orden_Medio_Pago_Compra = table.Column<int>(type: "integer", nullable: true),
                    Id_Cheque_Emitido = table.Column<int>(type: "integer", nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Concepto = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: false),
                    Referencia = table.Column<string>(type: "character varying(120)", unicode: false, maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movimientos_Bancarios", x => x.Id_Movimiento_Bancario);
                    table.ForeignKey(
                        name: "FK_Movimientos_Bancarios_Cheques_Emitidos",
                        column: x => x.Id_Cheque_Emitido,
                        principalTable: "Cheques_Emitidos",
                        principalColumn: "Id_Cheque_Emitido");
                    table.ForeignKey(
                        name: "FK_Movimientos_Bancarios_Cuentas_Bancarias",
                        column: x => x.Id_Cuenta_Bancaria,
                        principalTable: "Cuentas_Bancarias",
                        principalColumn: "Id_Cuenta_Bancaria");
                    table.ForeignKey(
                        name: "FK_Movimientos_Bancarios_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                    table.ForeignKey(
                        name: "FK_Movimientos_Bancarios_Ordenes_Medios_Pagos_Compras",
                        column: x => x.Id_Orden_Medio_Pago_Compra,
                        principalTable: "Ordenes_Medios_Pagos_Compras",
                        principalColumn: "Id_Orden_Medio_Pago_Compra");
                    table.ForeignKey(
                        name: "FK_Movimientos_Bancarios_Tipos_Movimientos_Bancarios",
                        column: x => x.Id_Tipo_Movimiento_Bancario,
                        principalTable: "Tipos_Movimientos_Bancarios",
                        principalColumn: "Id_Tipo_Movimiento_Bancario");
                });

            migrationBuilder.CreateTable(
                name: "Depositos_Bancarios",
                columns: table => new
                {
                    Id_Deposito_Bancario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Cuenta_Bancaria = table.Column<int>(type: "integer", nullable: false),
                    Id_Tipo_Deposito_Bancario = table.Column<int>(type: "integer", nullable: false),
                    Id_Movimiento_Bancario = table.Column<int>(type: "integer", nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Concepto = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: false),
                    Estado = table.Column<string>(type: "character varying(40)", unicode: false, maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depositos_Bancarios", x => x.Id_Deposito_Bancario);
                    table.ForeignKey(
                        name: "FK_Depositos_Bancarios_Cuentas_Bancarias",
                        column: x => x.Id_Cuenta_Bancaria,
                        principalTable: "Cuentas_Bancarias",
                        principalColumn: "Id_Cuenta_Bancaria");
                    table.ForeignKey(
                        name: "FK_Depositos_Bancarios_Movimientos_Bancarios",
                        column: x => x.Id_Movimiento_Bancario,
                        principalTable: "Movimientos_Bancarios",
                        principalColumn: "Id_Movimiento_Bancario");
                    table.ForeignKey(
                        name: "FK_Depositos_Bancarios_Tipos_Depositos_Bancarios",
                        column: x => x.Id_Tipo_Deposito_Bancario,
                        principalTable: "Tipos_Depositos_Bancarios",
                        principalColumn: "Id_Tipo_Deposito_Bancario");
                });

            migrationBuilder.CreateTable(
                name: "Cheques_Mismo_Banco",
                columns: table => new
                {
                    Id_Cheque_Mismo_Banco = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Deposito_Bancario = table.Column<int>(type: "integer", nullable: false),
                    Numero_Cheque = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: false),
                    Librador = table.Column<string>(type: "character varying(180)", unicode: false, maxLength: 180, nullable: false),
                    Fecha_Emision = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cheques_Mismo_Banco", x => x.Id_Cheque_Mismo_Banco);
                    table.ForeignKey(
                        name: "FK_Cheques_Mismo_Banco_Depositos_Bancarios",
                        column: x => x.Id_Deposito_Bancario,
                        principalTable: "Depositos_Bancarios",
                        principalColumn: "Id_Deposito_Bancario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cheques_Terceros",
                columns: table => new
                {
                    Id_Cheque_Tercero = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Deposito_Bancario = table.Column<int>(type: "integer", nullable: false),
                    Banco_Emisor = table.Column<string>(type: "character varying(120)", unicode: false, maxLength: 120, nullable: false),
                    Numero_Cheque = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: false),
                    Librador = table.Column<string>(type: "character varying(180)", unicode: false, maxLength: 180, nullable: false),
                    Fecha_Emision = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Estado = table.Column<string>(type: "character varying(40)", unicode: false, maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cheques_Terceros", x => x.Id_Cheque_Tercero);
                    table.ForeignKey(
                        name: "FK_Cheques_Terceros_Depositos_Bancarios",
                        column: x => x.Id_Deposito_Bancario,
                        principalTable: "Depositos_Bancarios",
                        principalColumn: "Id_Deposito_Bancario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Detalles_Depositos_Bancarios",
                columns: table => new
                {
                    Id_Detalle_Deposito_Bancario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Deposito_Bancario = table.Column<int>(type: "integer", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Detalles_Depositos_Bancarios", x => x.Id_Detalle_Deposito_Bancario);
                    table.ForeignKey(
                        name: "FK_Detalles_Depositos_Bancarios_Depositos_Bancarios",
                        column: x => x.Id_Deposito_Bancario,
                        principalTable: "Depositos_Bancarios",
                        principalColumn: "Id_Deposito_Bancario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Tipos_Cuentas_Bancarias",
                columns: new[] { "Id_Tipo_Cuenta_Bancaria", "Nombre" },
                values: new object[,]
                {
                    { 1, "Corriente" },
                    { 2, "Ahorro" }
                });

            migrationBuilder.InsertData(
                table: "Tipos_Depositos_Bancarios",
                columns: new[] { "Id_Tipo_Deposito_Bancario", "Nombre" },
                values: new object[,]
                {
                    { 1, "Efectivo" },
                    { 2, "Cheque mismo banco" },
                    { 3, "Cheque terceros" }
                });

            migrationBuilder.InsertData(
                table: "Tipos_Movimientos_Bancarios",
                columns: new[] { "Id_Tipo_Movimiento_Bancario", "Nombre" },
                values: new object[,]
                {
                    { 1, "Débito" },
                    { 2, "Crédito" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bancos_Nombre",
                table: "Bancos",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cheques_Emitidos_Cuenta_Numero",
                table: "Cheques_Emitidos",
                columns: new[] { "Id_Cuenta_Bancaria", "Numero_Cheque" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cheques_Emitidos_Id_Movimiento_Bancario",
                table: "Cheques_Emitidos",
                column: "Id_Movimiento_Bancario");

            migrationBuilder.CreateIndex(
                name: "IX_Cheques_Emitidos_Id_Orden_Medio_Pago_Compra",
                table: "Cheques_Emitidos",
                column: "Id_Orden_Medio_Pago_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Cheques_Mismo_Banco_Id_Deposito_Bancario",
                table: "Cheques_Mismo_Banco",
                column: "Id_Deposito_Bancario");

            migrationBuilder.CreateIndex(
                name: "IX_Cheques_Terceros_Id_Deposito_Bancario",
                table: "Cheques_Terceros",
                column: "Id_Deposito_Bancario");

            migrationBuilder.CreateIndex(
                name: "IX_Cuentas_Bancarias_Banco_Numero",
                table: "Cuentas_Bancarias",
                columns: new[] { "Id_Banco", "Numero_Cuenta" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cuentas_Bancarias_Id_Cuenta_Contable",
                table: "Cuentas_Bancarias",
                column: "Id_Cuenta_Contable");

            migrationBuilder.CreateIndex(
                name: "IX_Cuentas_Bancarias_Id_Tipo_Cuenta_Bancaria",
                table: "Cuentas_Bancarias",
                column: "Id_Tipo_Cuenta_Bancaria");

            migrationBuilder.CreateIndex(
                name: "IX_Depositos_Bancarios_Id_Cuenta_Bancaria",
                table: "Depositos_Bancarios",
                column: "Id_Cuenta_Bancaria");

            migrationBuilder.CreateIndex(
                name: "IX_Depositos_Bancarios_Id_Movimiento_Bancario",
                table: "Depositos_Bancarios",
                column: "Id_Movimiento_Bancario");

            migrationBuilder.CreateIndex(
                name: "IX_Depositos_Bancarios_Id_Tipo_Deposito_Bancario",
                table: "Depositos_Bancarios",
                column: "Id_Tipo_Deposito_Bancario");

            migrationBuilder.CreateIndex(
                name: "IX_Detalles_Depositos_Bancarios_Id_Deposito_Bancario",
                table: "Detalles_Depositos_Bancarios",
                column: "Id_Deposito_Bancario");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_Bancarios_Id_Cheque_Emitido",
                table: "Movimientos_Bancarios",
                column: "Id_Cheque_Emitido");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_Bancarios_Id_Cuenta_Bancaria",
                table: "Movimientos_Bancarios",
                column: "Id_Cuenta_Bancaria");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_Bancarios_Id_Estado",
                table: "Movimientos_Bancarios",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_Bancarios_Id_Orden_Medio_Pago_Compra",
                table: "Movimientos_Bancarios",
                column: "Id_Orden_Medio_Pago_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_Bancarios_Id_Tipo_Movimiento_Bancario",
                table: "Movimientos_Bancarios",
                column: "Id_Tipo_Movimiento_Bancario");

            migrationBuilder.CreateIndex(
                name: "IX_Tipos_Cuentas_Bancarias_Nombre",
                table: "Tipos_Cuentas_Bancarias",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tipos_Depositos_Bancarios_Nombre",
                table: "Tipos_Depositos_Bancarios",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tipos_Movimientos_Bancarios_Nombre",
                table: "Tipos_Movimientos_Bancarios",
                column: "Nombre",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Cheques_Emitidos_Movimientos_Bancarios",
                table: "Cheques_Emitidos",
                column: "Id_Movimiento_Bancario",
                principalTable: "Movimientos_Bancarios",
                principalColumn: "Id_Movimiento_Bancario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cheques_Emitidos_Cuentas_Bancarias",
                table: "Cheques_Emitidos");

            migrationBuilder.DropForeignKey(
                name: "FK_Movimientos_Bancarios_Cuentas_Bancarias",
                table: "Movimientos_Bancarios");

            migrationBuilder.DropForeignKey(
                name: "FK_Cheques_Emitidos_Movimientos_Bancarios",
                table: "Cheques_Emitidos");

            migrationBuilder.DropTable(
                name: "Cheques_Mismo_Banco");

            migrationBuilder.DropTable(
                name: "Cheques_Terceros");

            migrationBuilder.DropTable(
                name: "Detalles_Depositos_Bancarios");

            migrationBuilder.DropTable(
                name: "Depositos_Bancarios");

            migrationBuilder.DropTable(
                name: "Tipos_Depositos_Bancarios");

            migrationBuilder.DropTable(
                name: "Cuentas_Bancarias");

            migrationBuilder.DropTable(
                name: "Bancos");

            migrationBuilder.DropTable(
                name: "Tipos_Cuentas_Bancarias");

            migrationBuilder.DropTable(
                name: "Movimientos_Bancarios");

            migrationBuilder.DropTable(
                name: "Cheques_Emitidos");

            migrationBuilder.DropTable(
                name: "Tipos_Movimientos_Bancarios");
        }
    }
}
