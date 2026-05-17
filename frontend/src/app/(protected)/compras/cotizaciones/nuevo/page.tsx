"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { CotizacionForm } from "@/components/compras/cotizacion-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { cotizacionesAPI } from "@/services/cotizacionesAPI";
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { CotizacionFormState, CotizacionDetalleSaveDTO, CotizacionSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const [pedidosDisponibles, setPedidosDisponibles] = useState<any[]>([]);
  const [detallesPedidosOriginales, setDetallesPedidosOriginales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarPedidosOrigen = async () => {
      try {
        setIsLoading(true);
        const [resPedidos, resDetalles] = await Promise.all([
          pedidosAPI.getAll(1, 500),
          pedidosDetallesAPI.getAll(1, 1000)
        ]);

        const listaPedidos = resPedidos.items || resPedidos || [];
        const listaDetalles = resDetalles.items || resDetalles || [];

        const filtrados = listaPedidos.filter(
          (p: any) => p.estado === "Aprobado" || p.estado === "Enviado" || p.estado === "Respondido"
        );

        setPedidosDisponibles(filtrados);
        setDetallesPedidosOriginales(listaDetalles);
      } catch (error) {
        console.error("Error al cargar pedidos de origen:", error);
        notify.error("Error", "No se pudo cargar el listado de pedidos de compra.");
      } finally {
        setIsLoading(false);
      }
    };

    cargarPedidosOrigen();
  }, []);

  const handleSubmit = async (data: CotizacionFormState) => {
    try {
      if (!data.items || data.items.length === 0) {
        notify.error("Cotización vacía", "Debe agregar ítems de productos a los detalles.");
        return;
      }

      // 1. Crear Cabecera de la Cotización usando el CotizacionSaveDTO estricto
      const cabeceraPayload: CotizacionSaveDTO = {
        idPedidoCompra: Number(data.solicitudCotizacionId),
        idEstado: data.idEstado || 1, // 1 por defecto (Pendiente)
        idProveedor: Number(data.proveedorId),
        numeroPedido: data.numeroPedido || Math.floor(Math.random() * 10000),
        fecha: data.fecha,
      };

      const nuevaCotizacion = await cotizacionesAPI.create(cabeceraPayload);

      // Evaluamos el ID que devuelva tu backend
      const idCotizacionGenerado = nuevaCotizacion.idPedidoCotizacion || nuevaCotizacion.idPedidoCotizacion;

      if (!idCotizacionGenerado) {
        throw new Error("No se pudo obtener el ID de la cotización generada.");
      }

      // 2. Guardar Detalles adaptados al tipo estricto 'CotizacionDetalleSaveDTO'
      for (const item of data.items) {
        const idProductoFinal = Number(item.productoId);

        if (!idProductoFinal) {
          console.warn("Se omitió un ítem por productoId inválido:", item);
          continue;
        }

        // Buscamos el detalle original en los pedidos para heredar su idCategoria
        const original = detallesPedidosOriginales.find(
          (d: any) =>
            String(d.idPedidoCompra) === String(data.solicitudCotizacionId) &&
            Number(d.idProducto || d.productoId) === idProductoFinal
        );


        const detallePayload: CotizacionDetalleSaveDTO = {
          idPedidoCotizacion: Number(idCotizacionGenerado),
          idProducto: idProductoFinal,
          idCategoria: original?.idCategoria ? Number(original.idCategoria) : 1,
          descripcion: item.descripcion || "Producto",
          cantidad: Number(item.cantidad) || 1,
          precioProducto: Number(item.precioUnitario) || 0,
          descuento: Number(item.descuento) || 0,
        };

        await cotizacionesDetallesAPI.create(detallePayload);
      }

      // 3. Cambiar el estado del pedido de origen
      try {
        await pedidosAPI.updateEstado(Number(data.solicitudCotizacionId), {
          idEstado: 4
        });
      } catch (errorPedido) {
        console.warn("Cotización guardada, pero falló la actualización del estado del Pedido:", errorPedido);
      }

      notify.success("Cotización guardada", "Se registró la cotización de forma exitosa.");
      router.push("/compras/cotizaciones");
    } catch (error) {
      console.error("Error al crear cotización:", error);
      notify.error("Error", "Hubo un problema al procesar la solicitud en el servidor.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Cotizaciones", href: "/compras/cotizaciones" },
          { label: "Nueva Cotización" },
        ]}
      />
      <main className="container mx-auto p-4 max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Nueva Cotización</h2>

        <CotizacionForm
          cotizacionEditada={null}
          pedidosLista={pedidosDisponibles}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/cotizaciones")}
        />
      </main>
    </div>
  );
}