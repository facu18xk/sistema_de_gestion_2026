"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { RrhhCrudPage } from "@/components/personas/rrhh-crud-page";
import { EmpleadoCargoForm } from "@/components/personas/rrhh-forms";
import { empleadosAPI } from "@/services/empleadosAPI";
import { cargosAPI, empleadosCargosAPI } from "@/services/rrhhAPI";
import { formatearFecha } from "@/utils/date-utils";
import {
  Cargo,
  Empleado,
  EmpleadoCargo,
  EmpleadoCargoSaveDTO,
} from "@/types/types";

function nombreEmpleado(value: EmpleadoCargo["empleado"]) {
  if (typeof value === "string") return value;
  if (value) return `${value.nombres} ${value.apellidos}`.trim();
  return "";
}

function nombreCargo(value: EmpleadoCargo["cargo"]) {
  if (typeof value === "string") return value;
  if (value) return value.nombre;
  return "";
}

export default function EmpleadosCargosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);

  return (
    <RrhhCrudPage<EmpleadoCargo, EmpleadoCargoSaveDTO>
      title="Historial de cargos"
      description="Asignación y vigencia de cargos por funcionario."
      buttonLabel="Asignar cargo"
      caption="Lista actualizada del historial de cargos."
      searchPlaceholder="Buscar por empleado, cargo o fecha..."
      emptyText="No hay cargos asignados."
      emptySearchText="No hay asignaciones que coincidan con la búsqueda."
      sheetTitle={(item) =>
        item ? "Editar asignación de cargo" : "Nueva asignación de cargo"
      }
      sheetDescription="Cargo vigente o histórico del funcionario."
      deleteTitle="¿Eliminar asignación?"
      deleteDescription={() => "Esta acción eliminará la asignación seleccionada."}
      api={empleadosCargosAPI}
      getId={(item) => item.idEmpleadoCargo}
      loadDependencies={async () => {
        const [empleadosRes, cargosRes] = await Promise.all([
          empleadosAPI.getAll(1, 1000),
          cargosAPI.getAll(1, 1000),
        ]);
        setEmpleados(empleadosRes.items);
        setCargos(cargosRes.items);
      }}
      getSearchText={(item) =>
        `${nombreEmpleado(item.empleado)} ${nombreCargo(item.cargo)} ${
          item.fechaDesde
        } ${item.fechaHasta ?? ""}`
      }
      columns={[
        {
          header: "Empleado",
          cell: (item) =>
            nombreEmpleado(item.empleado) || `#${item.idEmpleado}`,
        },
        {
          header: "Cargo",
          cell: (item) => nombreCargo(item.cargo) || `#${item.idCargo}`,
        },
        {
          header: "Desde",
          cell: (item) => formatearFecha(item.fechaDesde),
        },
        {
          header: "Hasta",
          cell: (item) =>
            item.fechaHasta ? formatearFecha(item.fechaHasta) : "Vigente",
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
        <EmpleadoCargoForm
          registroEditado={item}
          empleados={empleados}
          cargos={cargos}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    />
  );
}
