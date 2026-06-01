import type { ReactNode } from "react";
import { API_CONFIG } from "@/config/api";
import { getStaticIdParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getStaticIdParams(API_CONFIG.ENDPOINTS.PEDIDOS, [
    "idPedidoCompra",
    "pedidoCompraId",
    "id",
  ]);
}

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
