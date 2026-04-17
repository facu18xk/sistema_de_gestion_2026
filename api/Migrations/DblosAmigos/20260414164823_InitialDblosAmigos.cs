using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations.DblosAmigos
{
    /// <inheritdoc />
    public partial class InitialDblosAmigos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    Id_Categoria = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.Id_Categoria);
                });

            migrationBuilder.CreateTable(
                name: "Depositos",
                columns: table => new
                {
                    Id_Deposito = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depositos", x => x.Id_Deposito);
                });

            migrationBuilder.CreateTable(
                name: "Estados",
                columns: table => new
                {
                    Id_Estado = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estados", x => x.Id_Estado);
                });

            migrationBuilder.CreateTable(
                name: "Marcas",
                columns: table => new
                {
                    Id_Marca = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marcas", x => x.Id_Marca);
                });

            migrationBuilder.CreateTable(
                name: "Medios_Pagos_Compras",
                columns: table => new
                {
                    Id_Medio_Pago_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medios_Pagos_Compras", x => x.Id_Medio_Pago_Compra);
                });

            migrationBuilder.CreateTable(
                name: "Paises",
                columns: table => new
                {
                    Id_Pais = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Paises", x => x.Id_Pais);
                });

            migrationBuilder.CreateTable(
                name: "Timbrados",
                columns: table => new
                {
                    Id_Timbrado = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Fecha_Inicio = table.Column<DateOnly>(type: "date", nullable: false),
                    Fecha_Final = table.Column<DateOnly>(type: "date", nullable: false),
                    RUC = table.Column<string>(type: "character varying(12)", unicode: false, maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Timbrados", x => x.Id_Timbrado);
                });

            migrationBuilder.CreateTable(
                name: "Pedidos_Compras",
                columns: table => new
                {
                    Id_Pedido_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Estado = table.Column<int>(type: "integer", nullable: false),
                    Numero_Pedido = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos_Compra", x => x.Id_Pedido_Compra);
                    table.ForeignKey(
                        name: "FK_Pedidos_Compras_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                columns: table => new
                {
                    Id_Producto = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Marca = table.Column<int>(type: "integer", nullable: false),
                    Id_Categoria = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Es_Servicio = table.Column<bool>(type: "boolean", nullable: false),
                    Porcentaje_IVA = table.Column<decimal>(type: "numeric(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.Id_Producto);
                    table.ForeignKey(
                        name: "FK_Productos_Categorias",
                        column: x => x.Id_Categoria,
                        principalTable: "Categorias",
                        principalColumn: "Id_Categoria");
                    table.ForeignKey(
                        name: "FK_Productos_Marcas",
                        column: x => x.Id_Marca,
                        principalTable: "Marcas",
                        principalColumn: "Id_Marca");
                });

            migrationBuilder.CreateTable(
                name: "Ciudades",
                columns: table => new
                {
                    Id_Ciudad = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Pais = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ciudades", x => x.Id_Ciudad);
                    table.ForeignKey(
                        name: "FK_Ciudades_Paises1",
                        column: x => x.Id_Pais,
                        principalTable: "Paises",
                        principalColumn: "Id_Pais");
                });

            migrationBuilder.CreateTable(
                name: "Pedidos_Cotizaciones",
                columns: table => new
                {
                    Id_Pedido_Cotizacion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Pedido_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Estado = table.Column<int>(type: "integer", nullable: false),
                    Numero_Pedido = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos_Cotizaciones", x => x.Id_Pedido_Cotizacion);
                    table.ForeignKey(
                        name: "FK_Pedidos_Cotizaciones_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                    table.ForeignKey(
                        name: "FK_Pedidos_Cotizaciones_Pedidos_Compras",
                        column: x => x.Id_Pedido_Compra,
                        principalTable: "Pedidos_Compras",
                        principalColumn: "Id_Pedido_Compra");
                });

            migrationBuilder.CreateTable(
                name: "Pedidos_Compras_Detalles",
                columns: table => new
                {
                    Id_Pedido_Compra_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Pedido_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Categoria = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos_Compras_Detalles", x => x.Id_Pedido_Compra_Detalle);
                    table.ForeignKey(
                        name: "FK_Pedidos_Compras_Detalles_Pedidos_Compras",
                        column: x => x.Id_Pedido_Compra,
                        principalTable: "Pedidos_Compras",
                        principalColumn: "Id_Pedido_Compra");
                    table.ForeignKey(
                        name: "FK_Pedidos_Compras_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Stocks_Depositos",
                columns: table => new
                {
                    Id_Deposito = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocks_Depositos", x => x.Id_Deposito);
                    table.ForeignKey(
                        name: "FK_Stocks_Depositos_Depositos",
                        column: x => x.Id_Deposito,
                        principalTable: "Depositos",
                        principalColumn: "Id_Deposito");
                    table.ForeignKey(
                        name: "FK_Stocks_Depositos_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Direcciones",
                columns: table => new
                {
                    Id_Direccion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Calle_1 = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Calle_2 = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Id_Ciudad = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Direcciones", x => x.Id_Direccion);
                    table.ForeignKey(
                        name: "FK_Direcciones_Ciudades1",
                        column: x => x.Id_Ciudad,
                        principalTable: "Ciudades",
                        principalColumn: "Id_Ciudad");
                });

            migrationBuilder.CreateTable(
                name: "Pedidos_Cotizaciones_Detalles",
                columns: table => new
                {
                    Id_Pedido_Cotizacion_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Pedido_Cotizacion = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Categoria = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Producto = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos_Cotizaciones_Detalles", x => x.Id_Pedido_Cotizacion_Detalle);
                    table.ForeignKey(
                        name: "FK_Pedidos_Cotizaciones_Detalles_Pedidos_Cotizaciones",
                        column: x => x.Id_Pedido_Cotizacion,
                        principalTable: "Pedidos_Cotizaciones",
                        principalColumn: "Id_Pedido_Cotizacion");
                    table.ForeignKey(
                        name: "FK_Pedidos_Cotizaciones_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Personas",
                columns: table => new
                {
                    Id_Persona = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Direccion = table.Column<int>(type: "integer", nullable: false),
                    Nombres = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Apellidos = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Correo = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personas", x => x.Id_Persona);
                    table.ForeignKey(
                        name: "FK_Personas_Direcciones1",
                        column: x => x.Id_Direccion,
                        principalTable: "Direcciones",
                        principalColumn: "Id_Direccion");
                });

            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    Id_Cliente = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Persona = table.Column<int>(type: "integer", nullable: false),
                    CI = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    RUC = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Fecha_Nacimiento = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.Id_Cliente);
                    table.ForeignKey(
                        name: "FK_Clientes_Personas",
                        column: x => x.Id_Persona,
                        principalTable: "Personas",
                        principalColumn: "Id_Persona");
                });

            migrationBuilder.CreateTable(
                name: "Empleados",
                columns: table => new
                {
                    Id_Empleado = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Persona = table.Column<int>(type: "integer", nullable: false),
                    CI = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false),
                    RUC = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false),
                    Fecha_Ingreso = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleados", x => x.Id_Empleado);
                    table.ForeignKey(
                        name: "FK_Empleados_Personas",
                        column: x => x.Id_Persona,
                        principalTable: "Personas",
                        principalColumn: "Id_Persona");
                });

            migrationBuilder.CreateTable(
                name: "Proveedores",
                columns: table => new
                {
                    Id_Proveedor = table.Column<int>(type: "integer", nullable: false),
                    RUC = table.Column<string>(type: "character varying(50)", unicode: false, maxLength: 50, nullable: false),
                    Razon_Social = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Nombre_Fantasia = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proveedores", x => x.Id_Proveedor);
                    table.ForeignKey(
                        name: "FK_Proveedores_Personas",
                        column: x => x.Id_Proveedor,
                        principalTable: "Personas",
                        principalColumn: "Id_Persona");
                });

            migrationBuilder.CreateTable(
                name: "Presupuestos",
                columns: table => new
                {
                    Id_Presupuesto = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Cliente = table.Column<int>(type: "integer", nullable: false),
                    Id_Estado = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Fecha_Vencimiento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Presupuestos", x => x.Id_Presupuesto);
                    table.ForeignKey(
                        name: "FK_Presupuestos_Clientes",
                        column: x => x.Id_Cliente,
                        principalTable: "Clientes",
                        principalColumn: "Id_Cliente");
                    table.ForeignKey(
                        name: "FK_Presupuestos_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                });

            migrationBuilder.CreateTable(
                name: "Parientes",
                columns: table => new
                {
                    Id_Pariente = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Empleado = table.Column<int>(type: "integer", nullable: false),
                    Tipo_Relacion = table.Column<string>(type: "character(1)", unicode: false, fixedLength: true, maxLength: 1, nullable: false),
                    Edad = table.Column<short>(type: "smallint", nullable: false),
                    Fecha_Nacimiento = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parientes", x => x.Id_Pariente);
                    table.ForeignKey(
                        name: "FK_Parientes_Empleados",
                        column: x => x.Id_Empleado,
                        principalTable: "Empleados",
                        principalColumn: "Id_Empleado");
                });

            migrationBuilder.CreateTable(
                name: "Ordenes_Compras",
                columns: table => new
                {
                    Id_Orden_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Pedido_Cotizacion = table.Column<int>(type: "integer", nullable: false),
                    Id_Proveedor = table.Column<int>(type: "integer", nullable: false),
                    Id_Estado = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordenes_Compras", x => x.Id_Orden_Compra);
                    table.ForeignKey(
                        name: "FK_Ordenes_Compras_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                    table.ForeignKey(
                        name: "FK_Ordenes_Compras_Pedidos_Cotizaciones",
                        column: x => x.Id_Pedido_Cotizacion,
                        principalTable: "Pedidos_Cotizaciones",
                        principalColumn: "Id_Pedido_Cotizacion");
                    table.ForeignKey(
                        name: "FK_Ordenes_Compras_Proveedores",
                        column: x => x.Id_Proveedor,
                        principalTable: "Proveedores",
                        principalColumn: "Id_Proveedor");
                });

            migrationBuilder.CreateTable(
                name: "Ordenes_Pagos_Compras",
                columns: table => new
                {
                    Id_Orden_Pago_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Proveedor = table.Column<int>(type: "integer", nullable: false),
                    Id_Estado = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordenes_Pagos_Compras", x => x.Id_Orden_Pago_Compra);
                    table.ForeignKey(
                        name: "FK_Ordenes_Pagos_Compras_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                    table.ForeignKey(
                        name: "FK_Ordenes_Pagos_Compras_Proveedores",
                        column: x => x.Id_Proveedor,
                        principalTable: "Proveedores",
                        principalColumn: "Id_Proveedor");
                });

            migrationBuilder.CreateTable(
                name: "Ordenes_Ventas",
                columns: table => new
                {
                    Id_Orden_Venta = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Presupuesto = table.Column<int>(type: "integer", nullable: false),
                    Id_Cliente = table.Column<int>(type: "integer", nullable: false),
                    Id_Estado = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordenes_Ventas", x => x.Id_Orden_Venta);
                    table.ForeignKey(
                        name: "FK_Ordenes_Ventas_Clientes",
                        column: x => x.Id_Cliente,
                        principalTable: "Clientes",
                        principalColumn: "Id_Cliente");
                    table.ForeignKey(
                        name: "FK_Ordenes_Ventas_Estados",
                        column: x => x.Id_Estado,
                        principalTable: "Estados",
                        principalColumn: "Id_Estado");
                    table.ForeignKey(
                        name: "FK_Ordenes_Ventas_Presupuestos",
                        column: x => x.Id_Presupuesto,
                        principalTable: "Presupuestos",
                        principalColumn: "Id_Presupuesto");
                });

            migrationBuilder.CreateTable(
                name: "Presupuestos_Detalles",
                columns: table => new
                {
                    Id_Presupuesto_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Presupuesto = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    IVA = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Presupuestos_Detalles", x => x.Id_Presupuesto_Detalle);
                    table.ForeignKey(
                        name: "FK_Presupuestos_Detalles_Presupuestos",
                        column: x => x.Id_Presupuesto,
                        principalTable: "Presupuestos",
                        principalColumn: "Id_Presupuesto");
                    table.ForeignKey(
                        name: "FK_Presupuestos_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Facturas_Compras",
                columns: table => new
                {
                    Id_Factura_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Orden_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Proveedor = table.Column<int>(type: "integer", nullable: false),
                    Nro_Comprobante = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Timbrado = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facturas_Compras", x => x.Id_Factura_Compra);
                    table.ForeignKey(
                        name: "FK_Facturas_Compras_Ordenes_Compras",
                        column: x => x.Id_Orden_Compra,
                        principalTable: "Ordenes_Compras",
                        principalColumn: "Id_Orden_Compra");
                    table.ForeignKey(
                        name: "FK_Facturas_Compras_Proveedores",
                        column: x => x.Id_Proveedor,
                        principalTable: "Proveedores",
                        principalColumn: "Id_Proveedor");
                });

            migrationBuilder.CreateTable(
                name: "Ordenes_Compras_Detalles",
                columns: table => new
                {
                    Id_Orden_Compra_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Orden_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordenes_Compras_Detalles", x => x.Id_Orden_Compra_Detalle);
                    table.ForeignKey(
                        name: "FK_Ordenes_Compras_Detalles_Ordenes_Compras",
                        column: x => x.Id_Orden_Compra,
                        principalTable: "Ordenes_Compras",
                        principalColumn: "Id_Orden_Compra");
                    table.ForeignKey(
                        name: "FK_Ordenes_Compras_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Ordenes_Medios_Pagos_Compras",
                columns: table => new
                {
                    Id_Orden_Medio_Pago_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Orden_Pago_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Medio_Pago_Compra = table.Column<int>(type: "integer", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordenes_Medios_Pagos_Compras", x => x.Id_Orden_Medio_Pago_Compra);
                    table.ForeignKey(
                        name: "FK_Ordenes_Medios_Pagos_Compras_Medios_Pagos_Compras",
                        column: x => x.Id_Medio_Pago_Compra,
                        principalTable: "Medios_Pagos_Compras",
                        principalColumn: "Id_Medio_Pago_Compra");
                    table.ForeignKey(
                        name: "FK_Ordenes_Medios_Pagos_Compras_Ordenes_Pagos_Compras",
                        column: x => x.Id_Orden_Pago_Compra,
                        principalTable: "Ordenes_Pagos_Compras",
                        principalColumn: "Id_Orden_Pago_Compra");
                });

            migrationBuilder.CreateTable(
                name: "Facturas_Ventas",
                columns: table => new
                {
                    Id_Factura_venta = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Orden_Venta = table.Column<int>(type: "integer", nullable: false),
                    Id_Cliente = table.Column<int>(type: "integer", nullable: false),
                    Nro_Comprobante = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Id_Timbrado = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Id_Medio_Pago_Compra = table.Column<int>(type: "integer", nullable: false),
                    Fecha_Pago = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facturas_Ventas", x => x.Id_Factura_venta);
                    table.ForeignKey(
                        name: "FK_Facturas_Ventas_Clientes",
                        column: x => x.Id_Cliente,
                        principalTable: "Clientes",
                        principalColumn: "Id_Cliente");
                    table.ForeignKey(
                        name: "FK_Facturas_Ventas_Medios_Pagos_Compras",
                        column: x => x.Id_Medio_Pago_Compra,
                        principalTable: "Medios_Pagos_Compras",
                        principalColumn: "Id_Medio_Pago_Compra");
                    table.ForeignKey(
                        name: "FK_Facturas_Ventas_Ordenes_Ventas",
                        column: x => x.Id_Orden_Venta,
                        principalTable: "Ordenes_Ventas",
                        principalColumn: "Id_Orden_Venta");
                    table.ForeignKey(
                        name: "FK_Facturas_Ventas_Timbrados",
                        column: x => x.Id_Timbrado,
                        principalTable: "Timbrados",
                        principalColumn: "Id_Timbrado");
                });

            migrationBuilder.CreateTable(
                name: "Ordenes_Ventas_Detalles",
                columns: table => new
                {
                    Id_Orden_venta_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Orden_Venta = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordenes_Ventas_Detalles", x => x.Id_Orden_venta_Detalle);
                    table.ForeignKey(
                        name: "FK_Ordenes_Ventas_Detalles_Ordenes_Ventas",
                        column: x => x.Id_Orden_Venta,
                        principalTable: "Ordenes_Ventas",
                        principalColumn: "Id_Orden_Venta");
                    table.ForeignKey(
                        name: "FK_Ordenes_Ventas_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Facturas_Compras_Detalles",
                columns: table => new
                {
                    Id_Factura_Compra_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Factura_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Total_Bruto = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Total_IVA = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Total_Neto = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facturas_Compras_Detalles", x => x.Id_Factura_Compra_Detalle);
                    table.ForeignKey(
                        name: "FK_Facturas_Compras_Detalles_Facturas_Compras",
                        column: x => x.Id_Factura_Compra,
                        principalTable: "Facturas_Compras",
                        principalColumn: "Id_Factura_Compra");
                    table.ForeignKey(
                        name: "FK_Facturas_Compras_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Devoluciones_Compras",
                columns: table => new
                {
                    Id_Nota_Devolucion_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Factura_Compra = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Devoluciones_Compra", x => x.Id_Nota_Devolucion_Compra);
                    table.ForeignKey(
                        name: "FK_Notas_Devoluciones_Compras_Facturas_Compras",
                        column: x => x.Id_Factura_Compra,
                        principalTable: "Facturas_Compras",
                        principalColumn: "Id_Factura_Compra");
                });

            migrationBuilder.CreateTable(
                name: "Ordenes_Pagos_Compras_Detalles",
                columns: table => new
                {
                    Id_Orden_Pago_Compra_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Orden_Pago_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Factura_Compra = table.Column<int>(type: "integer", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ordenes_Pagos_Compras_Detalles", x => x.Id_Orden_Pago_Compra_Detalle);
                    table.ForeignKey(
                        name: "FK_Ordenes_Pagos_Compras_Detalles_Facturas_Compras",
                        column: x => x.Id_Factura_Compra,
                        principalTable: "Facturas_Compras",
                        principalColumn: "Id_Factura_Compra");
                    table.ForeignKey(
                        name: "FK_Ordenes_Pagos_Compras_Detalles_Ordenes_Pagos_Compras",
                        column: x => x.Id_Orden_Pago_Compra,
                        principalTable: "Ordenes_Pagos_Compras",
                        principalColumn: "Id_Orden_Pago_Compra");
                });

            migrationBuilder.CreateTable(
                name: "Facturas_Ventas_Detalles",
                columns: table => new
                {
                    Id_Factura_Venta_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Factura_Venta = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Total_Bruto = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Total_IVA = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Total_Neto = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facturas_Ventas_Detalles", x => x.Id_Factura_Venta_Detalle);
                    table.ForeignKey(
                        name: "FK_Facturas_Ventas_Detalles_Facturas_Ventas",
                        column: x => x.Id_Factura_Venta,
                        principalTable: "Facturas_Ventas",
                        principalColumn: "Id_Factura_venta");
                    table.ForeignKey(
                        name: "FK_Facturas_Ventas_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Devoluciones_Ventas",
                columns: table => new
                {
                    Id_Nota_Devolucion_Venta = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Factura_Venta = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Devoluciones_Venta", x => x.Id_Nota_Devolucion_Venta);
                    table.ForeignKey(
                        name: "FK_Notas_Devoluciones_Ventas_Facturas_Ventas",
                        column: x => x.Id_Factura_Venta,
                        principalTable: "Facturas_Ventas",
                        principalColumn: "Id_Factura_venta");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Creditos_Compras",
                columns: table => new
                {
                    Id_Nota_Credito_Compra = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Factura_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Nota_Devolucion_Compra = table.Column<int>(type: "integer", nullable: false),
                    Timbrado = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Motivo = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Total = table.Column<decimal>(type: "numeric(10,0)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Creditos_Compras", x => x.Id_Nota_Credito_Compra);
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Compras_Facturas_Compras",
                        column: x => x.Id_Factura_Compra,
                        principalTable: "Facturas_Compras",
                        principalColumn: "Id_Factura_Compra");
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Compras_Notas_Devoluciones_Compras",
                        column: x => x.Id_Nota_Devolucion_Compra,
                        principalTable: "Notas_Devoluciones_Compras",
                        principalColumn: "Id_Nota_Devolucion_Compra");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Devoluciones_Compras_Detalles",
                columns: table => new
                {
                    Id_Nota_Devolucion_Compra_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Nota_Devolucion_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Devoluciones_Compras_Detalles", x => x.Id_Nota_Devolucion_Compra_Detalle);
                    table.ForeignKey(
                        name: "FK_Notas_Devoluciones_Compras_Detalles_Notas_Devoluciones_Compras",
                        column: x => x.Id_Nota_Devolucion_Compra,
                        principalTable: "Notas_Devoluciones_Compras",
                        principalColumn: "Id_Nota_Devolucion_Compra");
                    table.ForeignKey(
                        name: "FK_Notas_Devoluciones_Compras_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Creditos_Ventas",
                columns: table => new
                {
                    Id_Nota_Credito_Venta = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Factura_Venta = table.Column<int>(type: "integer", nullable: false),
                    Id_Nota_Devolucion_Venta = table.Column<int>(type: "integer", nullable: false),
                    Id_Timbrado = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    Fecha_Emision = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Total = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Creditos_Ventas", x => x.Id_Nota_Credito_Venta);
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Ventas_Facturas_Ventas",
                        column: x => x.Id_Factura_Venta,
                        principalTable: "Facturas_Ventas",
                        principalColumn: "Id_Factura_venta");
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Ventas_Notas_Devoluciones_Ventas",
                        column: x => x.Id_Nota_Devolucion_Venta,
                        principalTable: "Notas_Devoluciones_Ventas",
                        principalColumn: "Id_Nota_Devolucion_Venta");
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Ventas_Timbrados",
                        column: x => x.Id_Timbrado,
                        principalTable: "Timbrados",
                        principalColumn: "Id_Timbrado");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Devoluciones_Ventas_Detalles",
                columns: table => new
                {
                    Id_Nota_Devolucion_Venta_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Nota_Devolucion_venta = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Devoluciones_Ventas_Detalles", x => x.Id_Nota_Devolucion_Venta_Detalle);
                    table.ForeignKey(
                        name: "FK_Notas_Devoluciones_Ventas_Detalles_Notas_Devoluciones_Ventas",
                        column: x => x.Id_Nota_Devolucion_venta,
                        principalTable: "Notas_Devoluciones_Ventas",
                        principalColumn: "Id_Nota_Devolucion_Venta");
                    table.ForeignKey(
                        name: "FK_Notas_Devoluciones_Ventas_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Creditos_Compras_Detalles",
                columns: table => new
                {
                    Id_Nota_Credito_Compra_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Nota_Credito_Compra = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Creditos_Compras_Detalles", x => x.Id_Nota_Credito_Compra_Detalle);
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Compras_Detalles_Notas_Creditos_Compras",
                        column: x => x.Id_Nota_Credito_Compra,
                        principalTable: "Notas_Creditos_Compras",
                        principalColumn: "Id_Nota_Credito_Compra");
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Compras_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateTable(
                name: "Notas_Creditos_Ventas_Detalles",
                columns: table => new
                {
                    Id_Nota_Credito_Venta_Detalle = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Nota_Credito_Venta = table.Column<int>(type: "integer", nullable: false),
                    Id_Producto = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio_Unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas_Creditos_Ventas_Detalles", x => x.Id_Nota_Credito_Venta_Detalle);
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Ventas_Detalles_Notas_Creditos_Ventas",
                        column: x => x.Id_Nota_Credito_Venta,
                        principalTable: "Notas_Creditos_Ventas",
                        principalColumn: "Id_Nota_Credito_Venta");
                    table.ForeignKey(
                        name: "FK_Notas_Creditos_Ventas_Detalles_Productos",
                        column: x => x.Id_Producto,
                        principalTable: "Productos",
                        principalColumn: "Id_Producto");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ciudades_Id_Pais",
                table: "Ciudades",
                column: "Id_Pais");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_Id_Persona",
                table: "Clientes",
                column: "Id_Persona");

            migrationBuilder.CreateIndex(
                name: "IX_Direcciones_Id_Ciudad",
                table: "Direcciones",
                column: "Id_Ciudad");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_Id_Persona",
                table: "Empleados",
                column: "Id_Persona");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Compras_Id_Orden_Compra",
                table: "Facturas_Compras",
                column: "Id_Orden_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Compras_Id_Proveedor",
                table: "Facturas_Compras",
                column: "Id_Proveedor");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Compras_Detalles_Id_Factura_Compra",
                table: "Facturas_Compras_Detalles",
                column: "Id_Factura_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Compras_Detalles_Id_Producto",
                table: "Facturas_Compras_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Id_Cliente",
                table: "Facturas_Ventas",
                column: "Id_Cliente");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Id_Medio_Pago_Compra",
                table: "Facturas_Ventas",
                column: "Id_Medio_Pago_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Id_Orden_Venta",
                table: "Facturas_Ventas",
                column: "Id_Orden_Venta");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Id_Timbrado",
                table: "Facturas_Ventas",
                column: "Id_Timbrado");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Detalles_Id_Factura_Venta",
                table: "Facturas_Ventas_Detalles",
                column: "Id_Factura_Venta");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_Ventas_Detalles_Id_Producto",
                table: "Facturas_Ventas_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Compras_Id_Factura_Compra",
                table: "Notas_Creditos_Compras",
                column: "Id_Factura_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Compras_Id_Nota_Devolucion_Compra",
                table: "Notas_Creditos_Compras",
                column: "Id_Nota_Devolucion_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Compras_Detalles_Id_Nota_Credito_Compra",
                table: "Notas_Creditos_Compras_Detalles",
                column: "Id_Nota_Credito_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Compras_Detalles_Id_Producto",
                table: "Notas_Creditos_Compras_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Ventas_Id_Factura_Venta",
                table: "Notas_Creditos_Ventas",
                column: "Id_Factura_Venta");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Ventas_Id_Nota_Devolucion_Venta",
                table: "Notas_Creditos_Ventas",
                column: "Id_Nota_Devolucion_Venta");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Ventas_Id_Timbrado",
                table: "Notas_Creditos_Ventas",
                column: "Id_Timbrado");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Ventas_Detalles_Id_Nota_Credito_Venta",
                table: "Notas_Creditos_Ventas_Detalles",
                column: "Id_Nota_Credito_Venta");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Creditos_Ventas_Detalles_Id_Producto",
                table: "Notas_Creditos_Ventas_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Devoluciones_Compras_Id_Factura_Compra",
                table: "Notas_Devoluciones_Compras",
                column: "Id_Factura_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Devoluciones_Compras_Detalles_Id_Nota_Devolucion_Comp~",
                table: "Notas_Devoluciones_Compras_Detalles",
                column: "Id_Nota_Devolucion_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Devoluciones_Compras_Detalles_Id_Producto",
                table: "Notas_Devoluciones_Compras_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Devoluciones_Ventas_Id_Factura_Venta",
                table: "Notas_Devoluciones_Ventas",
                column: "Id_Factura_Venta");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Devoluciones_Ventas_Detalles_Id_Nota_Devolucion_venta",
                table: "Notas_Devoluciones_Ventas_Detalles",
                column: "Id_Nota_Devolucion_venta");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_Devoluciones_Ventas_Detalles_Id_Producto",
                table: "Notas_Devoluciones_Ventas_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Compras_Id_Estado",
                table: "Ordenes_Compras",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Compras_Id_Pedido_Cotizacion",
                table: "Ordenes_Compras",
                column: "Id_Pedido_Cotizacion");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Compras_Id_Proveedor",
                table: "Ordenes_Compras",
                column: "Id_Proveedor");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Compras_Detalles_Id_Orden_Compra",
                table: "Ordenes_Compras_Detalles",
                column: "Id_Orden_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Compras_Detalles_Id_Producto",
                table: "Ordenes_Compras_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Medios_Pagos_Compras_Id_Medio_Pago_Compra",
                table: "Ordenes_Medios_Pagos_Compras",
                column: "Id_Medio_Pago_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Medios_Pagos_Compras_Id_Orden_Pago_Compra",
                table: "Ordenes_Medios_Pagos_Compras",
                column: "Id_Orden_Pago_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Pagos_Compras_Id_Estado",
                table: "Ordenes_Pagos_Compras",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Pagos_Compras_Id_Proveedor",
                table: "Ordenes_Pagos_Compras",
                column: "Id_Proveedor");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Pagos_Compras_Detalles_Id_Factura_Compra",
                table: "Ordenes_Pagos_Compras_Detalles",
                column: "Id_Factura_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Pagos_Compras_Detalles_Id_Orden_Pago_Compra",
                table: "Ordenes_Pagos_Compras_Detalles",
                column: "Id_Orden_Pago_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Ventas_Id_Cliente",
                table: "Ordenes_Ventas",
                column: "Id_Cliente");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Ventas_Id_Estado",
                table: "Ordenes_Ventas",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Ventas_Id_Presupuesto",
                table: "Ordenes_Ventas",
                column: "Id_Presupuesto");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Ventas_Detalles_Id_Orden_Venta",
                table: "Ordenes_Ventas_Detalles",
                column: "Id_Orden_Venta");

            migrationBuilder.CreateIndex(
                name: "IX_Ordenes_Ventas_Detalles_Id_Producto",
                table: "Ordenes_Ventas_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Parientes_Id_Empleado",
                table: "Parientes",
                column: "Id_Empleado");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Compras_Id_Estado",
                table: "Pedidos_Compras",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Compras_Detalles_Id_Pedido_Compra",
                table: "Pedidos_Compras_Detalles",
                column: "Id_Pedido_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Compras_Detalles_Id_Producto",
                table: "Pedidos_Compras_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Cotizaciones_Id_Estado",
                table: "Pedidos_Cotizaciones",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Cotizaciones_Id_Pedido_Compra",
                table: "Pedidos_Cotizaciones",
                column: "Id_Pedido_Compra");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Cotizaciones_Detalles_Id_Pedido_Cotizacion",
                table: "Pedidos_Cotizaciones_Detalles",
                column: "Id_Pedido_Cotizacion");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Cotizaciones_Detalles_Id_Producto",
                table: "Pedidos_Cotizaciones_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_Id_Direccion",
                table: "Personas",
                column: "Id_Direccion");

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_Id_Cliente",
                table: "Presupuestos",
                column: "Id_Cliente");

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_Id_Estado",
                table: "Presupuestos",
                column: "Id_Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_Detalles_Id_Presupuesto",
                table: "Presupuestos_Detalles",
                column: "Id_Presupuesto");

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_Detalles_Id_Producto",
                table: "Presupuestos_Detalles",
                column: "Id_Producto");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Id_Categoria",
                table: "Productos",
                column: "Id_Categoria");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Id_Marca",
                table: "Productos",
                column: "Id_Marca");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_Depositos_Id_Producto",
                table: "Stocks_Depositos",
                column: "Id_Producto");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Facturas_Compras_Detalles");

            migrationBuilder.DropTable(
                name: "Facturas_Ventas_Detalles");

            migrationBuilder.DropTable(
                name: "Notas_Creditos_Compras_Detalles");

            migrationBuilder.DropTable(
                name: "Notas_Creditos_Ventas_Detalles");

            migrationBuilder.DropTable(
                name: "Notas_Devoluciones_Compras_Detalles");

            migrationBuilder.DropTable(
                name: "Notas_Devoluciones_Ventas_Detalles");

            migrationBuilder.DropTable(
                name: "Ordenes_Compras_Detalles");

            migrationBuilder.DropTable(
                name: "Ordenes_Medios_Pagos_Compras");

            migrationBuilder.DropTable(
                name: "Ordenes_Pagos_Compras_Detalles");

            migrationBuilder.DropTable(
                name: "Ordenes_Ventas_Detalles");

            migrationBuilder.DropTable(
                name: "Parientes");

            migrationBuilder.DropTable(
                name: "Pedidos_Compras_Detalles");

            migrationBuilder.DropTable(
                name: "Pedidos_Cotizaciones_Detalles");

            migrationBuilder.DropTable(
                name: "Presupuestos_Detalles");

            migrationBuilder.DropTable(
                name: "Stocks_Depositos");

            migrationBuilder.DropTable(
                name: "Notas_Creditos_Compras");

            migrationBuilder.DropTable(
                name: "Notas_Creditos_Ventas");

            migrationBuilder.DropTable(
                name: "Ordenes_Pagos_Compras");

            migrationBuilder.DropTable(
                name: "Empleados");

            migrationBuilder.DropTable(
                name: "Depositos");

            migrationBuilder.DropTable(
                name: "Productos");

            migrationBuilder.DropTable(
                name: "Notas_Devoluciones_Compras");

            migrationBuilder.DropTable(
                name: "Notas_Devoluciones_Ventas");

            migrationBuilder.DropTable(
                name: "Categorias");

            migrationBuilder.DropTable(
                name: "Marcas");

            migrationBuilder.DropTable(
                name: "Facturas_Compras");

            migrationBuilder.DropTable(
                name: "Facturas_Ventas");

            migrationBuilder.DropTable(
                name: "Ordenes_Compras");

            migrationBuilder.DropTable(
                name: "Medios_Pagos_Compras");

            migrationBuilder.DropTable(
                name: "Ordenes_Ventas");

            migrationBuilder.DropTable(
                name: "Timbrados");

            migrationBuilder.DropTable(
                name: "Pedidos_Cotizaciones");

            migrationBuilder.DropTable(
                name: "Proveedores");

            migrationBuilder.DropTable(
                name: "Presupuestos");

            migrationBuilder.DropTable(
                name: "Pedidos_Compras");

            migrationBuilder.DropTable(
                name: "Clientes");

            migrationBuilder.DropTable(
                name: "Estados");

            migrationBuilder.DropTable(
                name: "Personas");

            migrationBuilder.DropTable(
                name: "Direcciones");

            migrationBuilder.DropTable(
                name: "Ciudades");

            migrationBuilder.DropTable(
                name: "Paises");
        }
    }
}
