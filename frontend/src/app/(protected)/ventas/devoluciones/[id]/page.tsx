import DetalleNotaCreditoPage from "./client-page";
import { API_CONFIG } from "@/config/api";
import { getStaticIdParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getStaticIdParams(API_CONFIG.ENDPOINTS.NOTAS_CREDITOS_VENTAS, [
    "idNotaCreditoVenta",
    "notaCreditoVentaId",
    "id",
  ]);
}

export default function Page() {
  return <DetalleNotaCreditoPage />;
}
