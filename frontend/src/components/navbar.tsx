"use client";

<<<<<<< HEAD
import Link from "next/link";
import { useSyncExternalStore } from "react";
=======
import Link from "next/link";
import { useState, useEffect } from "react";
>>>>>>> front
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
<<<<<<< HEAD
import Cookies from "js-cookie";
import { notify } from "@/lib/notifications";

const DEFAULT_USER_NAME = "Usuario";

const subscribeToUserName = () => () => {};

const getStoredUserName = () => {
  if (typeof window === "undefined") {
    return DEFAULT_USER_NAME;
  }

  try {
    const userData = localStorage.getItem("user");

    if (!userData) {
      return DEFAULT_USER_NAME;
    }

    const user = JSON.parse(userData);
    return `${user.firstName} ${user.lastName}`;
  } catch {
    return DEFAULT_USER_NAME;
  }
};

//Para listar los diferentes módulos en el navbar
const modulos = [
  {
    title: "Ventas",
    items: [
      { title: "Clientes", href: "/ventas/clientes" },
      { title: "Presupuestos", href: "/ventas/presupuestos" },
      { title: "Facturación", href: "/ventas/facturacion" },
      { title: "Devoluciones", href: "/ventas/devoluciones" },
    ],
  },
  {
    title: "Compras",
    items: [
      { title: "Proveedores", href: "/compras/proveedores" },
      { title: "Pedidos", href: "/compras/pedidos" },
      { title: "Cotizaciones", href: "/compras/cotizaciones" },
      { title: "Órdenes de compra", href: "/compras/ordenes" },
      { title: "Facturas", href: "/compras/facturas" },
      { title: "Notas de crédito", href: "/compras/nota" },
      { title: "Pagos", href: "/compras/pagos" },
    ],
  },
  {
    title: "Banco y Tesorería",
    items: [
      { title: "Resumen", href: "/banco-tesoreria" },
      { title: "Caja", href: "/banco-tesoreria/caja" },
      { title: "Bancos", href: "/banco-tesoreria/bancos" },
      { title: "Cuentas bancarias", href: "/banco-tesoreria/cuentas" },
      {
        title: "Movimientos bancarios",
        href: "/banco-tesoreria/movimientos",
      },
      { title: "Cheques", href: "/banco-tesoreria/cheques" },
      { title: "Transferencias", href: "/banco-tesoreria/transferencias" },
      { title: "Depósitos bancarios", href: "/banco-tesoreria/depositos" },
      { title: "Conciliación bancaria", href: "/banco-tesoreria/conciliacion" },
      { title: "Órdenes de pago", href: "/banco-tesoreria/ordenes-pago" },
      { title: "Reportes", href: "/banco-tesoreria/reportes" },
    ],
  },
  {
    title: "Stock",
    items: [{ title: "Productos", href: "/stock/productos" }],
  },
  {
    title: "RRHH",
    items: [
      { title: "Empleados", href: "/personas/empleados" },
      { title: "Parientes", href: "/personas/parientes" },
    ],
  },
  {
    title: "Contabilidad",
    items: [
      { title: "Proceso contable", href: "/contabilidad/proceso-contable" },
      { title: "Periodo contable", href: "/contabilidad/periodo-contable" },
      { title: "Asientos", href: "/contabilidad/asientos" },
      { title: "Plan de cuentas", href: "/contabilidad/plan-cuentas" },
    ],
  },
];

export default function Navbar() {
  const userName = useSyncExternalStore(
    subscribeToUserName,
    getStoredUserName,
    () => DEFAULT_USER_NAME,
  );
  const router = useRouter();

  const handleLogout = () => {
=======
import Cookies from "js-cookie";
import { notify } from "@/lib/notifications";

//Para listar los diferentes módulos en el navbar
const modulos = [
  {
    title: "Ventas",
    items: ["Clientes", "Presupuestos", "Facturación", "Devoluciones"],
  },
  {
    title: "Compras",
    items: ["Proveedores", "Pedidos", "Cotizaciones", "Órdenes", "Pagos"],
  },
  {
    title: "Banco y Tesorería",
    items: [
      "Bancos",
      "Cuentas bancarias",
      "Movimientos bancarios",
      "Cheques",
      "Transferencias",
      "Depósitos Bancarios",
      "Conciliación bancaria",
      "Órdenes de pago",
      "Reportes",
    ],
  },
  { title: "Stock", items: ["Productos", "Depósitos", "Movimientos"] },
  { title: "RRHH", items: ["Empleados", "Parientes", "Nómina", "Asistencia"] },
  {
    title: "Contabilidad",
    items: [
      "Proceso Contable",
      "Periodo Contable",
      "Asientos",
      "Plan de Cuentas",
    ],
  },
];

const routeByItem: Record<string, string> = {
  Clientes: "/ventas/clientes",
  Presupuestos: "/ventas/presupuestos",
  Facturación: "/ventas/facturacion",
  Devoluciones: "/ventas/devoluciones",
  Proveedores: "/compras/proveedores",
  Pedidos: "/compras/pedidos",
  Cotizaciones: "/compras/cotizaciones",
  Productos: "/stock/productos",
  Empleados: "/personas/empleados",
  Parientes: "/personas/parientes",
  "Proceso Contable": "/contabilidad/proceso-contable",
  "Periodo Contable": "/contabilidad/periodo-contable",
  Asientos: "/contabilidad/asientos",
  "Plan de Cuentas": "/contabilidad/plan-cuentas",
  Bancos: "/banco-tesoreria/bancos",
  "Cuentas bancarias": "/banco-tesoreria/cuentas",
  "Movimientos bancarios": "/banco-tesoreria/movimientos",
  Cheques: "/banco-tesoreria/cheques",
  Transferencias: "/banco-tesoreria/transferencias",
  "Depósitos Bancarios": "/banco-tesoreria/depositos",
  "Conciliación bancaria": "/banco-tesoreria/conciliacion",
  "Órdenes de pago": "/banco-tesoreria/ordenes-pago",
  Reportes: "/banco-tesoreria/reportes",
};

export default function Navbar() {
  const [userName, setUserName] = useState("Usuario");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(`${user.firstName} ${user.lastName}`);
    }
  }, []);

  const handleLogout = () => {
>>>>>>> front
    //1. Eliminar la cookie del token
    Cookies.remove("token", { path: "/" }); //Obs: mismo path que al momento de crear la cookie
    //2. Limpiar datos del usuario en el navegador
    localStorage.removeItem("user");
    //localStorage.clear() -> si se quiere borrar todo
    //3. Redirigir al login
    router.push("/login");
    //4. Opcional: Forzar un refresco para limpiar estados de React
    router.refresh();
    notify.warning("¡Sesión cerrada!");
  };

  return (
    <nav className="fixed top-0 w-full border-b bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* IZQUIERDA: Logo y Selects */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-bold text-xl text-primary shrink-0"
          >
            McQueen Tires
          </Link>

          {/* Selects de Módulos (Estilo Native Select con Tailwind) */}
          <NavigationMenu viewport={false} className="hidden lg:flex relative">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <Link href="/dashboard">Inicio</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {modulos.map((modulo) => (
                <NavigationMenuItem key={modulo.title}>
                  <NavigationMenuTrigger className="cursor-pointer">
                    {modulo.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
<<<<<<< HEAD
                    <ul className="cursor-pointer grid w-[240px] gap-2 p-4">
                      {modulo.items.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                {item.title}
                              </div>
                            </Link>
                          </NavigationMenuLink>
=======
                    <ul className="cursor-pointer grid w-[200px] gap-2 p-4">
                      {modulo.items.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={routeByItem[item] ?? "#"}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                {item}
                              </div>
                            </Link>
                          </NavigationMenuLink>
>>>>>>> front
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* DERECHA: Perfil y Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="mr-6 relative h-10 w-10 rounded-full cursor-pointer"
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Usuario"
                  />
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive focus:text-white"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
