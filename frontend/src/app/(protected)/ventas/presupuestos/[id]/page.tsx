import VerPresupuestoPage from "./client-page";
import { API_CONFIG } from "@/config/api";
import { getStaticIdParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getStaticIdParams(API_CONFIG.ENDPOINTS.PRESUPUESTOS, [
    "idPresupuesto",
    "presupuestoId",
    "id",
  ]);
}

export default function Page() {
  return <VerPresupuestoPage />;
}
