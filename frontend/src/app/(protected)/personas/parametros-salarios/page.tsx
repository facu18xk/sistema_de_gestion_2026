"use client";

import { Badge } from "@/components/ui/badge";
import { RrhhCrudPage } from "@/components/personas/rrhh-crud-page";
import { ParametroSalarioForm } from "@/components/personas/rrhh-forms";
import { parametrosSalariosAPI } from "@/services/rrhhAPI";
import { formatearFecha } from "@/utils/date-utils";
import { formatGuaranies } from "@/utils/money-format";
import { ParametroSalario, ParametroSalarioSaveDTO } from "@/types/types";

export default function ParametrosSalariosPage() {
  return (
    <RrhhCrudPage<ParametroSalario, ParametroSalarioSaveDTO>
      title="Parámetros salariales"
      description="Vigencias de salario mínimo, IPS y bonificación familiar."
      buttonLabel="Nuevo parámetro"
      caption="Lista actualizada de parámetros salariales."
      searchPlaceholder="Buscar por fecha, salario o porcentaje..."
      emptyText="No hay parámetros salariales registrados."
      emptySearchText="No hay parámetros que coincidan con la búsqueda."
      sheetTitle={(item) =>
        item ? "Editar parámetro salarial" : "Nuevo parámetro salarial"
      }
      sheetDescription="Valores usados por el proceso según la fecha de pago."
      deleteTitle="¿Eliminar parámetro?"
      deleteDescription={() => "Esta acción eliminará la vigencia seleccionada."}
      api={parametrosSalariosAPI}
      getId={(item) => item.idParametroSalario}
      getSearchText={(item) =>
        `${item.fechaDesde} ${item.fechaHasta ?? ""} ${item.salarioMinimo} ${
          item.porcentajeIpsEmpleado
        } ${item.porcentajeBonificacionFamiliar}`
      }
      columns={[
        {
          header: "Desde",
          cell: (item) => formatearFecha(item.fechaDesde),
        },
        {
          header: "Hasta",
          cell: (item) =>
            item.fechaHasta ? formatearFecha(item.fechaHasta) : "Sin fin",
        },
        {
          header: "Salario mínimo",
          cell: (item) => formatGuaranies(item.salarioMinimo),
        },
        {
          header: "IPS",
          cell: (item) => `${item.porcentajeIpsEmpleado}%`,
        },
        {
          header: "Bonificación",
          cell: (item) => `${item.porcentajeBonificacionFamiliar}%`,
        },
        {
          header: "Estado",
          cell: (item) => (
            <Badge variant={item.activo ? "activo" : "secondary"}>
              {item.activo ? "Activo" : "Inactivo"}
            </Badge>
          ),
        },
      ]}
      renderForm={({ item, onSubmit, onCancel }) => (
        <ParametroSalarioForm
          parametroEditado={item}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    />
  );
}
