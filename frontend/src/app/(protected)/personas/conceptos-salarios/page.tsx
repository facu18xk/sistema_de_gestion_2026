"use client";

import { Badge } from "@/components/ui/badge";
import { RrhhCrudPage } from "@/components/personas/rrhh-crud-page";
import { ConceptoSalarioForm } from "@/components/personas/rrhh-forms";
import { conceptosSalariosAPI } from "@/services/rrhhAPI";
import { ConceptoSalario, ConceptoSalarioSaveDTO } from "@/types/types";

export default function ConceptosSalariosPage() {
  return (
    <RrhhCrudPage<ConceptoSalario, ConceptoSalarioSaveDTO>
      title="Conceptos salariales"
      description="Ingresos, egresos y conceptos especiales para liquidación."
      buttonLabel="Nuevo concepto"
      caption="Lista actualizada de conceptos salariales."
      searchPlaceholder="Buscar por código, descripción o tipo..."
      emptyText="No hay conceptos salariales registrados."
      emptySearchText="No hay conceptos que coincidan con la búsqueda."
      sheetTitle={(item) =>
        item ? "Editar concepto salarial" : "Nuevo concepto salarial"
      }
      sheetDescription="Configuración de ingresos, egresos e impacto en IPS."
      deleteTitle="¿Eliminar concepto?"
      deleteDescription={(item) => (
        <>
          Esta acción eliminará <strong>{item.codigo}</strong>.
        </>
      )}
      api={conceptosSalariosAPI}
      getId={(item) => item.idConceptoSalario}
      getSearchText={(item) =>
        `${item.codigo} ${item.descripcion} ${item.tipo}`
      }
      columns={[
        { header: "Código", cell: (item) => item.codigo },
        { header: "Descripción", cell: (item) => item.descripcion },
        {
          header: "Tipo",
          cell: (item) => (
            <Badge variant={item.tipo === "Ingreso" ? "activo" : "secondary"}>
              {item.tipo}
            </Badge>
          ),
        },
        {
          header: "IPS",
          cell: (item) =>
            item.tipo === "Ingreso" && item.deducibleIps ? "Deducible" : "No",
        },
        {
          header: "Especial",
          cell: (item) => {
            const flags = [
              item.esSalarioBase ? "Salario" : "",
              item.esIps ? "IPS" : "",
              item.esBonificacionFamiliar ? "Bonificación" : "",
            ].filter(Boolean);
            return flags.length ? flags.join(", ") : "—";
          },
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
        <ConceptoSalarioForm
          conceptoEditado={item}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    />
  );
}
