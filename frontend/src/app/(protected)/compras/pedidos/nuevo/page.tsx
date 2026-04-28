"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { PedidoForm, Pedido } from "@/components/compras/pedido-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { notify } from "@/lib/notifications";

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [vistaForm, setVistaForm] = useState<"pedido" | "agregar-productos">(
    "pedido",
  );

  const handleSubmit = async (data: Pedido) => {
    try {
      if (data.items.length === 0) {
        notify.error("Pedido incompleto", "Debe agregar al menos un producto.");
        return;
      }

      const pedidoCreado = await pedidosAPI.create({
        idEstado: 1,
        fecha: data.fecha,
      });
      console.log("Pedido creado:", pedidoCreado);
      console.log("Items a guardar:", data.items);

      await Promise.all(
        data.items.map((item) =>
          pedidosDetallesAPI.create({
            idPedidoCompra: pedidoCreado.idPedidoCompra,
            idProducto: item.idProducto,
            categoria: item.categoria,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
          }),
        ),
      );

      notify.success("Pedido guardado", "El pedido se registró correctamente.");
      router.push("/compras/pedidos");
    } catch (error) {
      console.error("Error al guardar pedido:", error);
      notify.error("Error", "No se pudo guardar el pedido.");
    }
  };

  return (
    <div>
      <Navbar />

      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Pedidos", href: "/compras/pedidos" },
          { label: "Nuevo Pedido" },
        ]}
      />
      {vistaForm === "pedido" && (
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Pedido</h2>
      )}
      <PedidoForm
        pedidoEditado={null}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/compras/pedidos")}
        onVistaChange={setVistaForm}
      />
    </div>
  );
}
