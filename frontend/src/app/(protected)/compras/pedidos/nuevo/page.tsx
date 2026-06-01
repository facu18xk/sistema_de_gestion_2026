"use client";

import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { PedidoForm, Pedido, PedidoItem } from "@/components/compras/pedido-form";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { pedidosAPI } from "@/services/pedidosAPI";
import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { notify } from "@/lib/notifications";
import { PedidoSaveDTO, PedidoDetalleSaveDTO } from "@/types/types";

export default function NuevoPedidoPage() {
  const router = useRouter();

  const handleSubmit = async (data: Pedido) => {
    try {
      // Validación preventiva en el cliente
      if (!data.items || data.items.length === 0) {
        notify.error("Pedido incompleto", "Debe agregar al menos un producto a la tabla.");
        return;
      }

      // 1. Preparar la cabecera del Pedido basándonos estrictamente en PedidoSaveDTO
      // Al ser un pedido NUEVO, forzamos que empiece en idEstado: 1 (Pendiente) 
      const cabeceraPayload: PedidoSaveDTO = {
        idEstado: 1, // 1 = Pendiente
        numeroPedido: 0,
        fecha: data.fecha || new Date().toISOString(),
      };

      console.log("Enviando cabecera de pedido:", cabeceraPayload);

      // Guardamos la cabecera en el backend (POST)
      const nuevoPedido = await pedidosAPI.create(cabeceraPayload);

      // Recuperamos el ID que el backend le asignó en la base de datos
      const idPedidoGenerado = nuevoPedido.idPedidoCompra;

      // 2. Mapear y enviar los detalles en paralelo usando el ID del pedido recién creado
      const promesasNuevosDetalles = data.items.map((item: PedidoItem) => {
        const detallePayload: PedidoDetalleSaveDTO = {
          idPedidoCompra: idPedidoGenerado,
          idProducto: Number(item.idProducto),
          idCategoria: Number(item.idCategoria) || 1, // Control de fallback por si tu DB exige categoría
          descripcion: item.descripcion || "Sin descripción",
          cantidad: Number(item.cantidad),
        };

        return pedidosDetallesAPI.create(detallePayload);
      });

      // Esperamos que terminen de guardarse todos los ítems en el backend
      await Promise.all(promesasNuevosDetalles);

      notify.success("Pedido guardado", "El pedido y sus productos se han registrado con éxito.");
      router.push("/compras/pedidos");
    } catch (error: any) {
      console.error("Error al registrar pedido:", error);
      notify.error("Error de Registro", "No se pudo completar la carga en el servidor. Verifica los campos obligatorios.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageBreadcrumb
        steps={[
          { label: "Compras" },
          { label: "Pedidos", href: "/compras/pedidos" },
          { label: "Nuevo Pedido" },
        ]}
      />
      <div className="container mx-auto py-6 max-w-5xl">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Nuevo Pedido</h2>

        <PedidoForm
          pedidoEditado={null} // Pasamos null explícitamente para indicarle que es un alta nueva
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/pedidos")}
        />
      </div>
    </div>
  );
}