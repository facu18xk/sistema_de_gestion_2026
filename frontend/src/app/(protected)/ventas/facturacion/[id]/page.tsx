import DetalleFacturaPage from "./client-page";
import { API_CONFIG } from "@/config/api";
import { getStaticIdParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getStaticIdParams(API_CONFIG.ENDPOINTS.INVOICES, [
    "idFacturaVenta",
    "facturaVentaId",
    "id",
  ]);
}

export default function Page() {
  return <DetalleFacturaPage />;
}
