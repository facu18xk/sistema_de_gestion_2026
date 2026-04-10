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

//Para probar
let users = [
    {
        email: "admin@admin.com",
        password: "test123"
    },
    {
        email: "user@user.com",
        password: "test123"
    }
];

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
            const response = await fetch("http://localhost:5066/api/Auth/iniciar",{
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({email, password}),
            })

            const data = await response.json();

            if (!response.ok) {
                //Si el backend responde con 401, 400, 500, etc.
                throw new Error(data.message || "Credenciales incorrectas");
            }

            // ÉXITO: Guardar el token (si el backend devuelve uno)
            console.log("Login exitoso:", data)
            localStorage.setItem("token", data.token) // O como se llame el campo en tu API

            router.push("/dashboard")
        } catch(err: any){
            setError(err.message);
        } finally {
            setIsLoading(false);
        }

        /*let found = users.find(u => u.email === email && u.password === password);

        //Simulamos una comunicación con el backend
        setTimeout(() => {
            if (found) {
                setIsLoading(false);
                alert("¡Login exitoso!");
                router.push("/dashboard"); //Redirige a la página principal
            }
            else {
                setIsLoading(false);
                alert("Email y/o Contraseña incorrectos!");
            }
        }, 1500)*/

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
