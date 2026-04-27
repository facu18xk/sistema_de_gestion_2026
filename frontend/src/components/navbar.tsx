"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Cookies from 'js-cookie'
import { notify } from "@/lib/notifications"

//Para listar los diferentes módulos en el navbar
const modulos = [
  { title: "Ventas", items: ["Facturación", "Clientes", "Reportes"] },
  { title: "Compras", items: ["Proveedores", "Órdenes", "Pedidos", "Pagos"] },
  { title: "Banco y Tesorería", items: ["Cuentas", "Conciliación", "Caja"] },
  { title: "Stock", items: ["Productos", "Depósitos", "Movimientos"] },
  { title: "RRHH", items: ["Empleados", "Nómina", "Asistencia"] },
]

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
    //1. Eliminar la cookie del token
    Cookies.remove("token", { path: '/' }) //Obs: mismo path que al momento de crear la cookie
    //2. Limpiar datos del usuario en el navegador
    localStorage.removeItem("user")
    //localStorage.clear() -> si se quiere borrar todo
    //3. Redirigir al login
    router.push("/login")
    //4. Opcional: Forzar un refresco para limpiar estados de React
    router.refresh()
    notify.warning("¡Sesión cerrada!");
  }

  return (
    <nav className="fixed top-0 w-full border-b bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* IZQUIERDA: Logo y Selects */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-xl text-primary shrink-0">
            McQueen Tires
          </Link>

          {/* Selects de Módulos (Estilo Native Select con Tailwind) */}
          <NavigationMenu viewport={false} className="hidden lg:flex relative">
            <NavigationMenuList>
              <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <Link href="/dashboard">Inicio</Link>
                  </NavigationMenuLink>
              </NavigationMenuItem>

              {modulos.map((modulo) => (
                <NavigationMenuItem key={modulo.title}>
                  <NavigationMenuTrigger className="cursor-pointer">{modulo.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="cursor-pointer grid w-[200px] gap-2 p-4">
                      {modulo.items.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item === "Productos" ? "/stock/productos" :
                                item == "Proveedores" ? "/compras/proveedores" :
                                  item === "Clientes" ? "/ventas/clientes" :
                                    item === "Empleados" ? "/personas/empleados" :
                                      item === "Pedidos" ? "/compras/pedidos" :
                                        "#"
                              }
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{item}</div>
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

        {/* DERECHA: Perfil y Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="mr-6 relative h-10 w-10 rounded-full cursor-pointer">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Usuario" />
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
                className="text-destructive focus:bg-destructive"
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