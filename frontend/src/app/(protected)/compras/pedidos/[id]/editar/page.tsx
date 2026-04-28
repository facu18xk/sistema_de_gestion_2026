"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter, useParams } from "next/navigation";
import { PedidoForm, Pedido } from "@/components/compras/pedido-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";

export default function EditarPedidoPage() {
  const router = useRouter();
  const params = useParams();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const formatearNumeroPedido = (numero: number | string) => {
    return `PD-${String(numero).padStart(4, "0")}`;
  };
  useEffect(() => {
    const cargarPedido = async () => {
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
            cantidad: d.cantidad,
            descripcion: d.descripcion,
            categoria: d.categoria,
            esNuevo: false,
          })),
        });
      } catch (error) {
        console.error("Error al cargar pedido:", error);
      }
    };

    cargarPedido();
  }, [params.id]);

  const handleSubmit = async (data: Pedido) => {
    const obtenerIdEstado = (estado: string) => {
      switch (estado) {
        case "Pendiente":
          return 1;
        case "Aprobado":
          return 2;
        case "Enviado":
          return 3;
        case "Respondido":
          return 4;
        default:
          return 1;
      }
    };
    try {
      const id = Number(params.id);

      await pedidosAPI.update(id, {
        idEstado: obtenerIdEstado(data.estado),
        fecha: data.fecha,
      });

      await Promise.all(
        data.items.map((item) => {
          const detalleData = {
            idPedidoCompra: id,
            idProducto: item.idProducto,
            categoria: item.categoria,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
          };

          if (item.esNuevo) {
            return pedidosDetallesAPI.create(detalleData);
          }

          return pedidosDetallesAPI.update(Number(item.id), detalleData);
        }),
      );

      router.push("/compras/pedidos");
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
    }
  };

  if (!pedido) {
    return <div className="p-6">Cargando pedido...</div>;
  }

  return (
    <div>
      <Navbar />
      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Pedidos", href: "/compras/pedidos" },
          { label: "Editar Pedido" },
        ]}
      />

      <h2 className="text-2xl font-bold tracking-tight">Editar Pedido</h2>

      <PedidoForm
        pedidoEditado={pedido}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/compras/pedidos")}
      />
    </div>
  );
}
