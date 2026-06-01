"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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

import { notify } from "@/lib/notifications";

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
    title: "Stock",
    items: ["Productos", "Depósitos", "Movimientos"],
  },
  {
    title: "RRHH",
    items: ["Empleados", "Parientes", "Nómina", "Asistencia"],
  },
  {
    title: "Contabilidad",
    items: [
      "Proceso Contable",
      "Periodo Contable",
      "Asientos",
      "Plan de Cuentas",
    ],
  },
  {
    title: "Tesorería y Bancos",
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
];

const routeByItem: Record<string, string> = {
  Clientes: "/ventas/clientes",
  Presupuestos: "/ventas/presupuestos",
  Facturación: "/ventas/facturacion",
  Devoluciones: "/ventas/devoluciones",

  Proveedores: "/compras/proveedores",
  Pedidos: "/compras/pedidos",
  Cotizaciones: "/compras/cotizaciones",
  Órdenes: "/compras/ordenes",
  Pagos: "/compras/pagos",

  Productos: "/stock/productos",
  Depósitos: "/stock/depositos",
  Movimientos: "/stock/movimientos",

  Empleados: "/personas/empleados",
  Parientes: "/personas/parientes",
  Nómina: "/personas/nomina",
  Asistencia: "/personas/asistencia",

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

type StoredUser = {
  firstName?: string;
  lastName?: string;
};

export default function Navbar() {
  const [userName, setUserName] = useState("Usuario");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) return;

    try {
      const user: StoredUser = JSON.parse(userData);
      const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

      if (fullName) {
        setUserName(fullName);
      }
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    localStorage.removeItem("user");

    notify.warning("¡Sesión cerrada!");

    router.push("/login");
    router.refresh();
  };

  const avatarFallback = userName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* IZQUIERDA: Logo y navegación */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="shrink-0 text-xl font-bold text-primary"
          >
            McQueen Tires
          </Link>

          <NavigationMenu viewport={false} className="relative hidden lg:flex">
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
                    <ul className="grid w-[220px] gap-2 p-4">
                      {modulo.items.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={routeByItem[item] ?? "#"}
                              className="block select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {item}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* DERECHA: Perfil y logout */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 cursor-pointer rounded-full"
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Usuario"
                  />
                  <AvatarFallback>{avatarFallback || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/perfil">Perfil</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/configuracion">Configuración</Link>
              </DropdownMenuItem>

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
