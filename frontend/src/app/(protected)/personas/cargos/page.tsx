"use client";

import { Badge } from "@/components/ui/badge";
import { RrhhCrudPage } from "@/components/personas/rrhh-crud-page";
import { CargoForm } from "@/components/personas/rrhh-forms";
import { cargosAPI } from "@/services/rrhhAPI";
import { Cargo, CargoSaveDTO } from "@/types/types";

export default function CargosPage() {
  return (
    <RrhhCrudPage<Cargo, CargoSaveDTO>
      title="Cargos"
      description="Gestión de cargos disponibles para funcionarios."
      buttonLabel="Nuevo cargo"
      caption="Lista actualizada de cargos."
      searchPlaceholder="Buscar por nombre o descripción..."
      emptyText="No hay cargos registrados."
      emptySearchText="No hay cargos que coincidan con la búsqueda."
      sheetTitle={(item) => (item ? "Editar cargo" : "Nuevo cargo")}
      sheetDescription="Datos básicos del cargo."
      deleteTitle="¿Eliminar cargo?"
      deleteDescription={(item) => (
        <>
          Esta acción eliminará <strong>{item.nombre}</strong>.
        </>
      )}
      api={cargosAPI}
      getId={(item) => item.idCargo}
      getSearchText={(item) => `${item.nombre} ${item.descripcion ?? ""}`}
      columns={[
        { header: "Nombre", cell: (item) => item.nombre },
        {
          header: "Descripción",
          cell: (item) => item.descripcion || "Sin descripción",
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
        <CargoForm
          cargoEditado={item}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    />
  );
}
