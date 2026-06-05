"use client";

import { useRouter } from "next/navigation";
import { PedidoForm, Pedido, PedidoItem } from "@/components/compras/pedido-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { pedidosAPI } from "@/services/pedidosAPI";
import { notify } from "@/lib/notifications";
import { PedidoCompletoSaveDTO } from "@/types/types";

export default function NuevoPedidoPage() {
  const router = useRouter();

  const handleSubmit = async (data: Pedido) => {
    try {
      if (!data.items || data.items.length === 0) {
        notify.error("Pedido incompleto", "Debe agregar al menos un producto a la tabla.");
        return;
      }

      const pedidoPayload: PedidoCompletoSaveDTO = {
        idEstado: 1,
        numeroPedido: 0,
        fecha: data.fecha || new Date().toISOString(),
        detalles: data.items.map((item: PedidoItem) => ({
          idProducto: Number(item.idProducto),
          idCategoria: Number(item.idCategoria) || 1,
          descripcion: item.descripcion || "Sin descripción",
          cantidad: Number(item.cantidad),
        })),
      };

      await pedidosAPI.createCompleto(pedidoPayload);

      notify.success("Pedido guardado", "El pedido y sus productos se han registrado con éxito.");
      router.push("/compras/pedidos");
    } catch (error: any) {
      console.error("Error al registrar pedido:", error);
      const message =
        error?.response?.data?.message ||
        "No se pudo completar la carga en el servidor. Verifica los campos obligatorios.";
      notify.error("Error de Registro", message);
    }
  };

  return (
    <div className="bg-background">
      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Pedidos", href: "/compras/pedidos" },
          { label: "Nuevo Pedido" },
        ]}
      />
      <div className="container py-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Nuevo Pedido</h2>

        <PedidoForm
          pedidoEditado={null}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/pedidos")}
        />
      </div>
    </div>
  );
}
