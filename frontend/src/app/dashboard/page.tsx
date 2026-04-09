import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Control ERP</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$12,450.00</p>
          </CardContent>
        </Card>
        {/* Aquí tus compañeros pueden ir agregando más métricas */}
      </div>
    </div>
  )
}