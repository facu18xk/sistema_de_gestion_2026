import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Intentamos obtener el token de las cookies
  const token = request.cookies.get('token')?.value

  const { pathname } = request.nextUrl

  // Definimos las rutas
  const isAuthPage = pathname.startsWith('/login')
  // Protegemos todo lo que esté en (protected) o rutas específicas
  const isProtectedPage = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/stock') ||
    pathname.startsWith('/compras') ||
    pathname.startsWith('/ventas') ||
    pathname.startsWith('personas')

  // CASO 1: El usuario no tiene token e intenta entrar a una ruta protegida
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // CASO 2: El usuario ya tiene token e intenta ir al login
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// IMPORTANTE: El matcher debe cubrir todas las rutas que queramos controlar
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/stock/:path*',
    '/ventas/:path*',
    '/compras/:path*',
    '/personas/:path',
    '/login'
  ],
}