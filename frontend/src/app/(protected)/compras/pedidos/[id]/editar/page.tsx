"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { PedidoForm, Pedido, PedidoItem } from "@/components/compras/pedido-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { notify } from "@/lib/notifications";
import { PedidoDetalleSaveDTO } from "@/types/types";

export default function EditarPedidoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  // Capturamos si viene ?readOnly=true desde la URL
  const isReadOnly = searchParams?.get("readOnly") === "true";

  const formatearNumeroPedido = (numero: number | string) => {
    return `PD-${String(numero).padStart(4, "0")}`;
  };

  useEffect(() => {
    const cargarPedido = async () => {
      if (!params?.id || isNaN(Number(params.id))) {
        return;
      }

      try {
        const id = Number(params.id);
        const data = await pedidosAPI.getById(id);

        let detallesDelPedido: any[] = [];
        try {
          const detalles = await pedidosDetallesAPI.getAll(1, 100);
          detallesDelPedido = detalles.items.filter(
            (d: any) => d.idPedidoCompra === id,
          );
        } catch (error) {
          console.error("Error al cargar detalles:", error);
        }

        setPedido({
          id: data.idPedidoCompra.toString(),
          nroPedido: formatearNumeroPedido(data.idPedidoCompra),
          fecha: data.fecha.substring(0, 10),
          estado: data.estado,
          items: detallesDelPedido.map((d: any) => ({
            id: d.idPedidoCompraDetalle,
            idProducto: d.idProducto,
            idCategoria: d.idCategoria,
            cantidad: d.cantidad,
            descripcion: d.descripcion,
            categoria: d.categoria,
            esNuevo: false,
          })),
        });
      } catch (error) {
        console.error("Error al cargar pedido:", error);
        notify.error("Error de carga", "No se pudo recuperar la información del pedido.");
      }
    };

    cargarPedido();
  }, [params?.id]);

  const handleSubmit = async (data: Pedido) => {
    try {
      if (!data.items || data.items.length === 0) {
        notify.error("Pedido incompleto", "Debe agregar al menos un producto.");
        return;
      }

      const id = Number(params.id);

      const obtenerIdEstado = (estado: string) => {
        switch (estado) {
          case "Pendiente": return 1;
          case "Aprobado": return 2;
          case "Enviado": return 3;
          case "Respondido": return 4;
          default: return 1;
        }
      };

      await pedidosAPI.update(id, {
        idEstado: obtenerIdEstado(data.estado),
        fecha: data.fecha,
      });

      const resDetalles = await pedidosDetallesAPI.getAll(1, 100);
      const detallesABorrar = resDetalles.items.filter(
        (d: any) => d.idPedidoCompra === id
      );

      await Promise.all(
        detallesABorrar.map((d: any) =>
          pedidosDetallesAPI.delete(d.idPedidoCompraDetalle)
        )
      );

      const promesasNuevosDetalles = data.items.map((item: PedidoItem) => {
        const detallePayload: PedidoDetalleSaveDTO = {
          idPedidoCompra: id,
          idProducto: item.idProducto,
          idCategoria: item.idCategoria,
          descripcion: item.descripcion || "",
          cantidad: Number(item.cantidad),
        };

        return pedidosDetallesAPI.create(detallePayload);
      });

      await Promise.all(promesasNuevosDetalles);

      notify.success("Pedido actualizado", "Los detalles han sido reemplazados y guardados.");
      router.push("/compras/pedidos");
    } catch (error: any) {
      console.error(error);
      notify.error("Error", "No se pudo completar la actualización por reemplazo.");
    }
  };

  // Spinner/Cargando idéntico a tu lógica original para evitar flasheos de layouts vacíos
  if (!pedido) {
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
          { label: "Pedidos", href: "/compras/pedidos" },
          { label: isReadOnly ? "Visualizar Pedido" : "Editar Pedido" },
        ]}
      />
      <div className="container">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          {isReadOnly ? "Visualizar Pedido" : "Editar Pedido"}
        </h2>

        <PedidoForm
          pedidoEditado={pedido}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/pedidos")}
          readOnly={isReadOnly}
        />
      </div>
    </div>
  );
}