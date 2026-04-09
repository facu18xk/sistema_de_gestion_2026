"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        //LLAMADA A LA API
        console.log("Enviando datos:", {email, password});

        //Simulamos una comunicación con el backend
        setTimeout(() => {
            setIsLoading(false);
            alert("¡Login exitoso!");
            router.push("/dashboard"); //Redirige a la página principal
        }, 1500)
    }
  
    return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50">
      <form onSubmit={handleLogin}>
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">ERP Sistema 2026</CardTitle>
            <CardDescription className="text-center">
                Ingresa tus credenciales
            </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
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
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  )
}