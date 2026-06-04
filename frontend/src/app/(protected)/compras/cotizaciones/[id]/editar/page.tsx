"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter, useParams, useSearchParams } from "next/navigation"; // Importamos useSearchParams
import { CotizacionForm } from "@/components/compras/cotizacion-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button"; // Importamos Button para la navegación cruzada
import { FileText, Heading5 } from "lucide-react"; // Importamos el icono para el botón
import { cotizacionesAPI } from "@/services/cotizacionesAPI";
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { CotizacionFormState, CotizacionDetalleSaveDTO, CotizacionSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function EditarCotizacionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams(); // Hook para leer parámetros de la URL (?mode=ver)

  const [cotizacion, setCotizacion] = useState<CotizacionFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pedidosDisponibles, setPedidosDisponibles] = useState<any[]>([]);
  const [detallesPedidosOriginales, setDetallesPedidosOriginales] = useState<any[]>([]);

  // Detectamos si viene explícitamente en modo ver o si el estado cargado no es Pendiente (ej. si idEstado !== 1)
  const esModoVerUrl = searchParams.get("view") === "true";
  const isViewMode = esModoVerUrl || (cotizacion ? cotizacion.idEstado !== 1 : false);

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
          const estadoValid = p.estado === "Aprobado" || p.estado === "Enviado" || p.estado === "Respondido";
          return coincideConActual || estadoValid;
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

  const handleVerOrdenesAsociadas = () => {
    if (params.id) {
      // Redirecciona al listado de órdenes aplicando el filtro por el ID de esta cotización
      router.push(`/compras/ordenes?idCotizacion=${params.id}`);
    }
  };

  const handleSubmit = async (data: CotizacionFormState) => {
    if (isViewMode) return; // Seguridad: Evita llamadas al API si está en modo lectura

    try {
      const idCotizacion = Number(params.id);

      const cabeceraPayload: CotizacionSaveDTO = {
        idPedidoCompra: Number(data.solicitudCotizacionId),
        idEstado: data.idEstado,
        idProveedor: Number(data.proveedorId),
        numeroPedido: data.numeroPedido,
        fecha: data.fecha,
      };

      await cotizacionesAPI.update(idCotizacion, cabeceraPayload);

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

      for (const item of data.items) {
        const idProductoFinal = Number(item.productoId);

        if (!idProductoFinal) {
          console.warn("Se omitió un ítem por productoId inválido:", item);
          continue;
        }

        const original = detallesPedidosOriginales.find(
          (d: any) =>
            String(d.idPedidoCompra) === String(data.solicitudCotizacionId) &&
            Number(d.idProducto || d.productoId) === idProductoFinal
        );

        const detallePayload: CotizacionDetalleSaveDTO = {
          idPedidoCotizacion: idCotizacion,
          idProducto: idProductoFinal,
          idCategoria: original?.idCategoria ? Number(original.idCategoria) : 1,
          descripcion: item.descripcion || "Producto",
          cantidad: Number(item.cantidad) || 1,
          precioProducto: Number(item.precioUnitario) || 0,
          descuento: Number(item.descuento) || 0
        };

        await cotizacionesDetallesAPI.create(detallePayload);
      }

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
    <div className="bg-background">
      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Cotizaciones", href: "/compras/cotizaciones" },
          { label: isViewMode ? "Ver Cotización" : "Editar Cotización" }, // Breadcrumb dinámico
        ]}
      />
      <main className="container p-2">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-bold tracking-tight">
            {isViewMode ? "Ver Cotización" : "Editar Cotización"} #{params.id} {/* Título dinámico */}
          </h5>

          {/* Botón dinámico insertado en la cabecera si la cotización está Aprobada (idEstado === 2) */}
          {cotizacion && Number(cotizacion.idEstado) === 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVerOrdenesAsociadas}
              className="flex items-center gap-2 border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 dark:border-emerald-900/30 dark:text-emerald-400 font-medium"
            >
              <FileText className="h-4 w-4" />
              Ver Órdenes Emitidas
            </Button>
          )}
        </div>

        <CotizacionForm
          cotizacionEditada={cotizacion}
          pedidosLista={pedidosDisponibles}
          deshabilitarSeleccion={isViewMode} // Deshabilita los selectores por completo si es modo vista
          isReadOnly={isViewMode}            // Nueva prop para ocultar/modificar los botones inferiores
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/cotizaciones")}
        />
      </main>
    </div>
  );
}