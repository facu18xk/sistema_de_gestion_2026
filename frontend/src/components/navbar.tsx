"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const router = useRouter()

  // Lista de módulos para los Selects
  const modulos = ["Inicio", "Ventas", "Compras", "Banco y Tesorería", "Stock", "RRHH"]

  return (
    <nav className="fixed top-0 w-full border-b bg-white/80 backdrop-blur-md z-50 rounded-b-xl shadow-lg">
        <div className="flex h-16 items-center justify-between px-4">
            <div className="ml-6 flex items-center gap-6">
                {/*Nombre ERP*/}
                <Link href="/dashboard" className="font-bold text-xl text-primary shrink-0">McQueen Tires</Link>

                {/*Selects de Módulos*/}
                <div className="hidden lg:flex items-center gap-2">
                    {modulos.map((modulo) => (
                        <select 
                            key={modulo}
                            className="bg-transparent text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer outline-none p-1 rounded-md transition-colors"
                        >
                        <option value="">{modulo}</option>
                        <option value="ver">Ver {modulo}</option>
                        <option value="nuevo">Nuevo Registro</option>
                        <option value="reportes">Reportes</option>
                        </select>
                    ))}
                </div>
            </div>

            {/*Usuario y Logout*/}
            <div className="mr-8 flex items-center gap-4">
                <Avatar>
                    <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="foto de usuario"
                    />
                    <AvatarFallback>JP</AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium leading-none">Juan Pérez</p>
                    <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
                <Button className="cursor-pointer bg-red-400 text-black font-medium" onClick={() => router.push("/login")}>Log Out</Button>
            </div>
        </div>
    </nav>
  )
}