"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter, useParams } from "next/navigation";
import { PedidoForm, Pedido, PedidoItem } from "@/components/compras/pedido-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { notify } from "@/lib/notifications";
import { PedidoDetalleSaveDTO } from "@/types/types";

export default function EditarPedidoPage() {
  const router = useRouter();
  const params = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const formatearNumeroPedido = (numero: number | string) => {
    return `PD-${String(numero).padStart(4, "0")}`;
  };

  useEffect(() => {
    const cargarPedido = async () => {
      // MODIFICACIÓN SEGURA: Si no hay id o no es un número válido (ej. precarga de Next.js), frena la ejecución.
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

  if (!pedido) {
    return <div className="p-6">Cargando datos...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Pedidos", href: "/compras/pedidos" },
          { label: "Editar Pedido" },
        ]}
      />
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Editar Pedido</h2>

        <PedidoForm
          pedidoEditado={pedido}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/pedidos")}
        />
      </div>
    </div>
  );
}