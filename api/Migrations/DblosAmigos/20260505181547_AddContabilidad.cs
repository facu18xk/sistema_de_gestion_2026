using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class AddContabilidad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "modulos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_modulos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "procesos_contables",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    periodo_anho = table.Column<int>(type: "integer", nullable: false),
                    descripcion = table.Column<string>(type: "character varying(200)", unicode: false, maxLength: 200, nullable: true),
                    cant_niveles = table.Column<int>(type: "integer", nullable: true),
                    cant_digitos_nivel = table.Column<int>(type: "integer", nullable: true),
                    moneda = table.Column<string>(type: "character varying(10)", unicode: false, maxLength: 10, nullable: true),
                    estado = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_procesos_contables", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "modelos_asientos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    modulo_id = table.Column<int>(type: "integer", nullable: false),
                    tipo_asiento = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: true),
                    detalle_resumen = table.Column<string>(type: "character varying(200)", unicode: false, maxLength: 200, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_modelos_asientos", x => x.id);
                    table.ForeignKey(
                        name: "FK_modelos_asientos_modulos",
                        column: x => x.modulo_id,
                        principalTable: "modulos",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "cuentas_contables",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    proceso_contable_id = table.Column<int>(type: "integer", nullable: false),
                    cuenta_padre_id = table.Column<int>(type: "integer", nullable: true),
                    numero_cuenta = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    tipo_cuenta = table.Column<string>(type: "character varying(30)", unicode: false, maxLength: 30, nullable: false),
                    es_asentable = table.Column<bool>(type: "boolean", nullable: false),
                    activa = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cuentas_contables", x => x.id);
                    table.ForeignKey(
                        name: "FK_cuentas_contables_cuenta_padre",
                        column: x => x.cuenta_padre_id,
                        principalTable: "cuentas_contables",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_cuentas_contables_procesos_contables",
                        column: x => x.proceso_contable_id,
                        principalTable: "procesos_contables",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "periodos_contables",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    proceso_contable_id = table.Column<int>(type: "integer", nullable: false),
                    anho = table.Column<int>(type: "integer", nullable: false),
                    mes = table.Column<int>(type: "integer", nullable: false),
                    fecha_inicio = table.Column<DateOnly>(type: "date", nullable: false),
                    fecha_fin = table.Column<DateOnly>(type: "date", nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_periodos_contables", x => x.id);
                    table.ForeignKey(
                        name: "FK_periodos_contables_procesos_contables",
                        column: x => x.proceso_contable_id,
                        principalTable: "procesos_contables",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "modelos_asientos_detalles",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    modelo_asiento_id = table.Column<int>(type: "integer", nullable: false),
                    cuenta_contable_id = table.Column<int>(type: "integer", nullable: false),
                    item = table.Column<int>(type: "integer", nullable: false),
                    tipo_movimiento = table.Column<string>(type: "character varying(10)", unicode: false, maxLength: 10, nullable: false),
                    descripcion_item = table.Column<string>(type: "character varying(200)", unicode: false, maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_modelos_asientos_detalles", x => x.id);
                    table.ForeignKey(
                        name: "FK_modelos_asientos_detalles_cuentas_contables",
                        column: x => x.cuenta_contable_id,
                        principalTable: "cuentas_contables",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_modelos_asientos_detalles_modelos_asientos",
                        column: x => x.modelo_asiento_id,
                        principalTable: "modelos_asientos",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "asientos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    numero_asiento = table.Column<int>(type: "integer", nullable: false),
                    periodo_contable_id = table.Column<int>(type: "integer", nullable: false),
                    modulo_id = table.Column<int>(type: "integer", nullable: true),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    descripcion = table.Column<string>(type: "character varying(200)", unicode: false, maxLength: 200, nullable: true),
                    automatico = table.Column<bool>(type: "boolean", nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false),
                    referencia_origen = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: true),
                    id_origen = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    fecha_mayorizacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asientos", x => x.id);
                    table.ForeignKey(
                        name: "FK_asientos_modulos",
                        column: x => x.modulo_id,
                        principalTable: "modulos",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_asientos_periodos_contables",
                        column: x => x.periodo_contable_id,
                        principalTable: "periodos_contables",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "balances",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo_balance = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    periodo_contable_id = table.Column<int>(type: "integer", nullable: false),
                    fecha_generacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_balances", x => x.id);
                    table.ForeignKey(
                        name: "FK_balances_periodos_contables",
                        column: x => x.periodo_contable_id,
                        principalTable: "periodos_contables",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "asientos_detalles",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    asiento_id = table.Column<int>(type: "integer", nullable: false),
                    cuenta_contable_id = table.Column<int>(type: "integer", nullable: false),
                    item = table.Column<int>(type: "integer", nullable: false),
                    tipo_movimiento = table.Column<string>(type: "character varying(10)", unicode: false, maxLength: 10, nullable: false),
                    monto = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    descripcion_item = table.Column<string>(type: "character varying(200)", unicode: false, maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asientos_detalles", x => x.id);
                    table.ForeignKey(
                        name: "FK_asientos_detalles_asientos",
                        column: x => x.asiento_id,
                        principalTable: "asientos",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_asientos_detalles_cuentas_contables",
                        column: x => x.cuenta_contable_id,
                        principalTable: "cuentas_contables",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "balances_detalles",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    balance_id = table.Column<int>(type: "integer", nullable: false),
                    cuenta_contable_id = table.Column<int>(type: "integer", nullable: false),
                    total_debe = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_haber = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    saldo_deudor = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    saldo_acreedor = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_balances_detalles", x => x.id);
                    table.ForeignKey(
                        name: "FK_balances_detalles_balances",
                        column: x => x.balance_id,
                        principalTable: "balances",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_balances_detalles_cuentas_contables",
                        column: x => x.cuenta_contable_id,
                        principalTable: "cuentas_contables",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_asientos_modulo_id",
                table: "asientos",
                column: "modulo_id");

            migrationBuilder.CreateIndex(
                name: "IX_asientos_periodo_contable_id",
                table: "asientos",
                column: "periodo_contable_id");

            migrationBuilder.CreateIndex(
                name: "IX_asientos_detalles_asiento_id",
                table: "asientos_detalles",
                column: "asiento_id");

            migrationBuilder.CreateIndex(
                name: "IX_asientos_detalles_cuenta_contable_id",
                table: "asientos_detalles",
                column: "cuenta_contable_id");

            migrationBuilder.CreateIndex(
                name: "IX_balances_periodo_contable_id",
                table: "balances",
                column: "periodo_contable_id");

            migrationBuilder.CreateIndex(
                name: "IX_balances_detalles_balance_id",
                table: "balances_detalles",
                column: "balance_id");

            migrationBuilder.CreateIndex(
                name: "IX_balances_detalles_cuenta_contable_id",
                table: "balances_detalles",
                column: "cuenta_contable_id");

            migrationBuilder.CreateIndex(
                name: "IX_cuentas_contables_cuenta_padre_id",
                table: "cuentas_contables",
                column: "cuenta_padre_id");

            migrationBuilder.CreateIndex(
                name: "IX_cuentas_contables_proceso_contable_id",
                table: "cuentas_contables",
                column: "proceso_contable_id");

            migrationBuilder.CreateIndex(
                name: "IX_modelos_asientos_modulo_id",
                table: "modelos_asientos",
                column: "modulo_id");

            migrationBuilder.CreateIndex(
                name: "IX_modelos_asientos_detalles_cuenta_contable_id",
                table: "modelos_asientos_detalles",
                column: "cuenta_contable_id");

            migrationBuilder.CreateIndex(
                name: "IX_modelos_asientos_detalles_modelo_asiento_id",
                table: "modelos_asientos_detalles",
                column: "modelo_asiento_id");

            migrationBuilder.CreateIndex(
                name: "IX_periodos_contables_proceso_contable_id",
                table: "periodos_contables",
                column: "proceso_contable_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asientos_detalles");

            migrationBuilder.DropTable(
                name: "balances_detalles");

            migrationBuilder.DropTable(
                name: "modelos_asientos_detalles");

            migrationBuilder.DropTable(
                name: "asientos");

            migrationBuilder.DropTable(
                name: "balances");

            migrationBuilder.DropTable(
                name: "cuentas_contables");

            migrationBuilder.DropTable(
                name: "modelos_asientos");

            migrationBuilder.DropTable(
                name: "periodos_contables");

            migrationBuilder.DropTable(
                name: "modulos");

            migrationBuilder.DropTable(
                name: "procesos_contables");
        }
    }
}
