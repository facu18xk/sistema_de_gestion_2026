"use client";

import { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarPedidosOrigen = async () => {
      try {
        setIsLoading(true);
        // Solamente traemos las cabeceras de los pedidos al iniciar para poblar el select.
        // Cero llamadas masivas a detalles aquí, evitando la duplicidad visual.
        const resPedidos = await pedidosAPI.getAll(1, 500);
        const listaPedidos = resPedidos.items || resPedidos || [];

        const filtrados = listaPedidos.filter(
          (p: any) => p.estado === "Aprobado" || p.estado === "Enviado" || p.estado === "Respondido"
        );

        setPedidosDisponibles(filtrados);
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

      const cabeceraPayload: CotizacionSaveDTO = {
        idPedidoCompra: Number(data.solicitudCotizacionId),
        idEstado: data.idEstado || 1,
        idProveedor: Number(data.proveedorId),
        numeroPedido: data.numeroPedido || Math.floor(Math.random() * 10000),
        fecha: data.fecha,
      };

      const nuevaCotizacion = await cotizacionesAPI.create(cabeceraPayload);
      const idCotizacionGenerado = nuevaCotizacion.idPedidoCotizacion;

      if (!idCotizacionGenerado) {
        throw new Error("No se pudo obtener el ID de la cotización generada.");
      }

      // Traemos los detalles del pedido específico solo al momento de guardar para validar categorías en el backend
      const resDetalles = await pedidosDetallesAPI.getAll(1, 1000);
      const listaDetalles = resDetalles.items || resDetalles || [];

      for (const item of data.items) {
        const idProductoFinal = Number(item.productoId);

        if (!idProductoFinal) {
          console.warn("Se omitió un ítem por productoId inválido:", item);
          continue;
        }

        const original = listaDetalles.find(
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
    <>
      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Cotizaciones", href: "/compras/cotizaciones" },
          { label: "Nueva Cotización" },
        ]}
      />
      <main className="container p-2">
        <h5 className=" font-bold tracking-tight mb-1">Nueva Cotización</h5>

        <CotizacionForm
          cotizacionEditada={null}
          pedidosLista={pedidosDisponibles}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/cotizaciones")}
        />
      </main>
    </>
  );
}