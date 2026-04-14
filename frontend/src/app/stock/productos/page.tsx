import Navbar from "@/components/navbar"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  
  // Datos de prueba (luego vendrán de la API de C#)
  const productos = [
    { id: "P001", descripcion: "Neumático Deportivo", marca: "McQueen", categoria: "Pista", precio: 120.50, cantidad: 45 },
    { id: "P002", descripcion: "Llanta Aleación", marca: "Tires Co", categoria: "Accesorios", precio: 85.00, cantidad: 12 },
    { id: "P003", descripcion: "Kit de Parche", marca: "QuickFix", categoria: "Mantenimiento", precio: 15.99, cantidad: 100 },
  ]
  
  export default function ProductosPage() {
    return (
      <div>
        <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        
        {/* BREADCRUMB */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Stock</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Productos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Listado de Productos</h1>
        </div>
  
        {/* TABLA DE PRODUCTOS */}
        <div className="rounded-md border bg-white">
          <Table>
            <TableCaption>Lista actualizada de productos en inventario.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.id}</TableCell>
                  <TableCell>{producto.descripcion}</TableCell>
                  <TableCell>{producto.marca}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">{producto.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      </div>
    )
  }