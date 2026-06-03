"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { notify } from "@/lib/notifications";
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

const DEFAULT_USER_NAME = "Usuario";

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
  const [userName, setUserName] = useState(DEFAULT_USER_NAME);
  const router = useRouter();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");

      if (!userData) {
        return;
      }

      const user = JSON.parse(userData);
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

      if (fullName) {
        setUserName(fullName);
      }
    } catch {
      setUserName(DEFAULT_USER_NAME);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    localStorage.removeItem("user");
    router.push("/login");
    router.refresh();
    notify.warning("¡Sesión cerrada!");
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
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
                    <ul className="grid w-[240px] cursor-pointer gap-2 p-4">
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
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative mr-6 h-10 w-10 cursor-pointer rounded-full"
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
