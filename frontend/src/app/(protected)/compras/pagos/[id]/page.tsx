import { notFound } from "next/navigation"

export function generateStaticParams() {
    return [{ id: "0" }]
}

export default function DetalleOrdenPagoCompraPage() {
    notFound()
}
