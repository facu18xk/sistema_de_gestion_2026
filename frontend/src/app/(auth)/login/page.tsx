"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Cookies from 'js-cookie'
import { authAPI } from "@/services/authAPI"
import { notify } from "@/lib/notifications"

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null) // Para mostrar errores de la API
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await authAPI.login(email, password); 
            // 1. Guardar el token en una Cookie (expira en 1 día)
            Cookies.set("token", data.token, { expires: 1, path: '/' });
            // 2. Guardar los datos del usuario en localStorage (para mostrar el nombre en el Navbar)
            localStorage.setItem("user", JSON.stringify(data.user));
            //Notificación de éxito
            notify.success("¡Bienvenido!", "Has iniciado sesión correctamente.");
            // 3. Redirigimos a /dashboard
            router.push("/dashboard");

          } catch (err: any) {
            setError(err.response?.data?.message || "Error al iniciar sesión");
            //Notificación de error
            notify.error("Error de autenticación", "Usuario o contraseña incorrectos.");
          } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-screen w-full pt-16 justify-center px-4 bg-slate-50"> {/*items-center*/}
            <nav className="fixed top-0 w-full border-b bg-white/80 backdrop-blur-md z-50 rounded-b-xl shadow-lg">
                <div className="ml-8 flex h-16 items-center justify-between px-4">
                    <span className="font-bold text-xl text-primary shrink-0">
                        McQueen Tires
                    </span>
                </div>
            </nav>
            <form onSubmit={handleLogin}>
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Bienvenido!</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tus credenciales
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nombre@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ?
                                (<>
                                    Cargando
                                    <Spinner data-icon="inline-end" />
                                </>) :
                                ("Iniciar Sesión")
                            }
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
