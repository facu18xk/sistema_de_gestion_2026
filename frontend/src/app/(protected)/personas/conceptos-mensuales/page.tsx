"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { RrhhCrudPage } from "@/components/personas/rrhh-crud-page";
import { EmpleadoConceptoMensualForm } from "@/components/personas/rrhh-forms";
import { empleadosAPI } from "@/services/empleadosAPI";
import {
  conceptosSalariosAPI,
  empleadosConceptosMensualesAPI,
} from "@/services/rrhhAPI";
import { formatearFecha } from "@/utils/date-utils";
import { formatGuaranies } from "@/utils/money-format";
import {
  ConceptoSalario,
  Empleado,
  EmpleadoConceptoMensual,
  EmpleadoConceptoMensualSaveDTO,
} from "@/types/types";

function empleadoNombre(
  value: EmpleadoConceptoMensual["empleado"],
  empleados: Empleado[],
  idEmpleado: number,
) {
  if (typeof value === "string") return value;
  if (value) return `${value.nombres} ${value.apellidos}`.trim();
  const empleado = empleados.find((item) => item.idEmpleado === idEmpleado);
  return empleado ? `${empleado.nombres} ${empleado.apellidos}`.trim() : "";
}

function conceptoNombre(
  value: EmpleadoConceptoMensual["conceptoSalario"],
  conceptos: ConceptoSalario[],
  idConceptoSalario: number,
) {
  if (typeof value === "string") return value;
  if (value) return `${value.codigo} - ${value.descripcion}`;
  const concepto = conceptos.find(
    (item) => item.idConceptoSalario === idConceptoSalario,
  );
  return concepto ? `${concepto.codigo} - ${concepto.descripcion}` : "";
}

export default function ConceptosMensualesPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoSalario[]>([]);

  return (
    <RrhhCrudPage<EmpleadoConceptoMensual, EmpleadoConceptoMensualSaveDTO>
      title="Conceptos mensuales"
      description="Asignaciones recurrentes por funcionario para generar nómina."
      buttonLabel="Nueva asignación"
      caption="Lista actualizada de conceptos mensuales."
      searchPlaceholder="Buscar por empleado, concepto o vigencia..."
      emptyText="No hay conceptos mensuales registrados."
      emptySearchText="No hay asignaciones que coincidan con la búsqueda."
      sheetTitle={(item) =>
        item ? "Editar concepto mensual" : "Nuevo concepto mensual"
      }
      sheetDescription="Concepto recurrente que se toma al generar el proceso."
      deleteTitle="¿Eliminar concepto mensual?"
      deleteDescription={() => "Esta acción eliminará la asignación seleccionada."}
      api={empleadosConceptosMensualesAPI}
      getId={(item) => item.idEmpleadoConceptoMensual}
      loadDependencies={async () => {
        const [empleadosRes, conceptosRes] = await Promise.all([
          empleadosAPI.getAll(1, 1000),
          conceptosSalariosAPI.getAll(1, 1000),
        ]);
        setEmpleados(empleadosRes.items);
        setConceptos(conceptosRes.items);
      }}
      getSearchText={(item) =>
        `${empleadoNombre(item.empleado, empleados, item.idEmpleado)} ${conceptoNombre(
          item.conceptoSalario,
          conceptos,
          item.idConceptoSalario,
        )} ${item.fechaDesde} ${item.fechaHasta ?? ""}`
      }
      columns={[
        {
          header: "Empleado",
          cell: (item) =>
            empleadoNombre(item.empleado, empleados, item.idEmpleado) ||
            `#${item.idEmpleado}`,
        },
        {
          header: "Concepto",
          cell: (item) =>
            conceptoNombre(
              item.conceptoSalario,
              conceptos,
              item.idConceptoSalario,
            ) || `#${item.idConceptoSalario}`,
        },
        {
          header: "Monto",
          cell: (item) => formatGuaranies(item.monto),
        },
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
          header: "Estado",
          cell: (item) => (
            <Badge variant={item.activo ? "activo" : "secondary"}>
              {item.activo ? "Activo" : "Inactivo"}
            </Badge>
          ),
        },
      ]}
      renderForm={({ item, onSubmit, onCancel }) => (
        <EmpleadoConceptoMensualForm
          registroEditado={item}
          empleados={empleados}
          conceptos={conceptos}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    />
  );
}
