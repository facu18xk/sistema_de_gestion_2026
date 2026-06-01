"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter, useParams } from "next/navigation";
import { CotizacionForm } from "@/components/compras/cotizacion-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { cotizacionesAPI } from "@/services/cotizacionesAPI";
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { CotizacionFormState, CotizacionDetalleSaveDTO, CotizacionSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function EditarCotizacionPage() {
  const router = useRouter();
  const params = useParams();

  const [cotizacion, setCotizacion] = useState<CotizacionFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pedidosDisponibles, setPedidosDisponibles] = useState<any[]>([]);
  const [detallesPedidosOriginales, setDetallesPedidosOriginales] = useState<any[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const idCotizacion = Number(params.id);

        const [data, resDetalles, resPedidos, resDetallesOriginales] = await Promise.all([
          cotizacionesAPI.getById(idCotizacion),
          cotizacionesDetallesAPI.getAll(1, 500),
          pedidosAPI.getAll(1, 500),
          pedidosDetallesAPI.getAll(1, 1000)
        ]);

        const listaDetalles = resDetalles.items || resDetalles || [];
        const detallesFiltrados = listaDetalles.filter(
          (d: any) => Number(d.idPedidoCotizacion || d.cotizacionCompraId) === idCotizacion
        );

        const listaPedidos = resPedidos.items || resPedidos || [];
        const filtrados = listaPedidos.filter((p: any) => {
          const coincideConActual = p.idPedidoCompra === data.idPedidoCompra;
          const estadoValido = p.estado === "Aprobado" || p.estado === "Enviado" || p.estado === "Respondido";
          return coincideConActual || estadoValido;
        });

        setPedidosDisponibles(filtrados);
        setDetallesPedidosOriginales(resDetallesOriginales.items || resDetallesOriginales || []);

        setCotizacion({
          solicitudCotizacionId: data.idPedidoCompra.toString(),
          proveedorId: data.idProveedor.toString(),
          fecha: data.fecha.substring(0, 10),
          validaHasta: data.validaHasta ? data.validaHasta.substring(0, 10) : data.fecha.substring(0, 10),
          idEstado: data.idEstado,
          numeroPedido: data.numeroPedido,
          items: detallesFiltrados.map((d: any) => ({
            idDetalle: d.idPedidoCotizacionDetalle || d.idCotizacionCompraDetalle,
            productoId: d.idProducto || d.productoId,
            descripcion: d.descripcion || d.producto || "Producto",
            cantidad: d.cantidad,
            precioUnitario: d.precioProducto || d.precioUnitario,
            descuento: d.descuento || 0,
          })),
        });

      } catch (error) {
        console.error("Error al cargar la cotización:", error);
        notify.error("Error", "No se pudieron obtener los datos de la cotización.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) cargarDatos();
  }, [params.id]);

  const handleSubmit = async (data: CotizacionFormState) => {
    try {
      const idCotizacion = Number(params.id);

      // 1. Cabecera
      const cabeceraPayload: CotizacionSaveDTO = {
        idPedidoCompra: Number(data.solicitudCotizacionId),
        idEstado: data.idEstado,
        idProveedor: Number(data.proveedorId),
        numeroPedido: data.numeroPedido,
        fecha: data.fecha,
      };

      await cotizacionesAPI.update(idCotizacion, cabeceraPayload);

      // 2. Limpieza de detalles anteriores
      const resDetallesActuales = await cotizacionesDetallesAPI.getAll(1, 500);
      const listaDetallesActuales = resDetallesActuales.items || resDetallesActuales || [];
      const detallesAELiminar = listaDetallesActuales.filter(
        (d: any) => Number(d.idPedidoCotizacion || d.cotizacionCompraId) === idCotizacion
      );

      for (const det of detallesAELiminar) {
        const idAEliminar = det.idPedidoCotizacionDetalle || det.idCotizacionCompraDetalle;
        if (idAEliminar) {
          await cotizacionesDetallesAPI.delete(idAEliminar);
        }
      }

      // 3. Iterar y guardar los nuevos detalles corrigiendo los campos según Swagger
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

        // Construcción del DTO estricto alineado al Backend
        const detallePayload: CotizacionDetalleSaveDTO = {
          idPedidoCotizacion: idCotizacion,
          idProducto: idProductoFinal,
          idCategoria: original?.idCategoria ? Number(original.idCategoria) : 1, // Por si no encuentra, manda 1 por defecto
          descripcion: item.descripcion || "Producto",
          cantidad: Number(item.cantidad) || 1,
          precioProducto: Number(item.precioUnitario) || 0,
          descuento: Number(item.descuento) || 0
        };

        await cotizacionesDetallesAPI.create(detallePayload);
      }

      // 4. Estado del Pedido Origen
      try {
        await pedidosAPI.updateEstado(Number(data.solicitudCotizacionId), {
          idEstado: 4
        });
      } catch (errorPedidoEstado) {
        console.warn("No se pudo actualizar el estado del Pedido Origen:", errorPedidoEstado);
      }

      notify.success("Éxito", "Cotización actualizada correctamente.");
      router.push("/compras/cotizaciones");
    } catch (error) {
      console.error("Error general al actualizar:", error);
      notify.error("Error", "No se pudieron guardar las modificaciones.");
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
          { label: "Editar Cotización" },
        ]}
      />
      <main className="container mx-auto p-4 max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Editar Cotización #{params.id}</h2>

        <CotizacionForm
          cotizacionEditada={cotizacion}
          pedidosLista={pedidosDisponibles}
          deshabilitarSeleccion={false}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/cotizaciones")}
        />
      </main>
    </div>
  );
}