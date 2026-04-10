"use client"

import Link from "next/link"
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
  
  const modulos = [
    { title: "Ventas", items: ["Facturación", "Clientes", "Reportes"] },
    { title: "Compras", items: ["Proveedores", "Órdenes", "Pagos"] },
    { title: "Banco y Tesorería", items: ["Cuentas", "Conciliación", "Caja"] },
    { title: "Stock", items: ["Productos", "Depósitos", "Movimientos"] },
    { title: "RRHH", items: ["Empleados", "Nómina", "Asistencia"] },
  ]

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    // Aquí iría la lógica para limpiar el token
    router.push("/login")
  }

  // Lista de módulos para los Selects
  //const modulos = ["Inicio", "Ventas", "Compras", "Banco y Tesorería", "Stock", "RRHH"]

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
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Inicio
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {modulos.map((modulo) => (
                <NavigationMenuItem key={modulo.title}>
                  <NavigationMenuTrigger className="cursor-pointer">{modulo.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="cursor-pointer grid w-[200px] gap-2 p-4">
                      {modulo.items.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">{item}</div>
                            </a>
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
            <p className="text-sm font-medium leading-none">Juan Pérez</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="mr-6 cursor-pointer relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Usuario" />
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive cursor-pointer"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  )
}