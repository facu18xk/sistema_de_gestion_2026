"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormContainer } from "@/components/FormContainer";
import { FieldWrapper } from "@/components/FieldWrapper";
import { PedidoItemsTable } from "@/components/compras/pedido-item-table";
import {
  AgregarProductosView,
  ProductoSeleccionable,
  ProductoSeleccionadoParaPedido,
} from "@/components/compras/agregar-producto-view";
import { productosAPI } from "@/services/productosAPI";
import { FormSheet } from "@/components/shared/form-sheet";
import { ProductoForm } from "@/components/stock/producto-form";

export interface PedidoItem {
  id: number | string;
  idProducto: number;
  cantidad: number;
  descripcion: string;
  categoria: string;
  esNuevo?: boolean;
}

export interface Pedido {
  id?: string;
  nroPedido: string;
  fecha: string;
  estado: string;
  items: PedidoItem[];
}

interface Props {
  pedidoEditado?: Pedido | null;
  onSubmit: (data: Pedido) => void;
  onCancel: () => void;
  onVistaChange?: (vista: "pedido" | "agregar-productos") => void;
}

export function PedidoForm({
  pedidoEditado,
  onSubmit,
  onCancel,
  onVistaChange,
}: Props) {
  const [formData, setFormData] = useState<Pedido>({
    nroPedido: "",
    fecha: "",
    estado: "Pendiente",
    items: [],
  });

  const [productos, setProductos] = useState<ProductoSeleccionable[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [vista, setVista] = useState<"pedido" | "agregar-productos">("pedido");
  const [sheetProductoOpen, setSheetProductoOpen] = useState(false);
  const cambiarVista = (nuevaVista: "pedido" | "agregar-productos") => {
    setVista(nuevaVista);
    onVistaChange?.(nuevaVista);
  };
  const esEditable = formData.estado === "Pendiente";
  useEffect(() => {
    if (pedidoEditado) {
      setFormData(pedidoEditado);
    }
  }, [pedidoEditado]);

  const cargarProductos = async () => {
    try {
      const res = await productosAPI.getAll(currentPage, itemsPerPage);

      const mapeados: ProductoSeleccionable[] = res.items.map((p) => ({
        id: p.idProducto,
        descripcion: p.descripcion,
        marca: p.marca,
        categoria: p.categoria,
        precio: p.precioUnitario,
        disponible: p.cantidadTotal,
      }));

      setProductos(mapeados);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [currentPage]);

  const updateField = (field: keyof Pedido, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (
    index: number,
    field: keyof PedidoItem,
    value: string | number,
  ) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };
    setFormData((prev) => ({ ...prev, items }));
  };

  const handleAgregarProductos = (
    productosSeleccionados: ProductoSeleccionadoParaPedido[],
  ) => {
    const nuevosItems = productosSeleccionados.map((p) => ({
      id: Date.now() + p.id,
      idProducto: p.id,
      cantidad: p.cantidad,
      descripcion: p.descripcion,
      categoria: p.categoria,
      esNuevo: true,
    }));

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, ...nuevosItems],
    }));

    cambiarVista("pedido");
  };

  if (vista === "agregar-productos") {
    return (
      <>
        <AgregarProductosView
          productos={productos}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onCancel={() => cambiarVista("pedido")}
          onNuevoProducto={() => setSheetProductoOpen(true)}
          onCargarProductos={handleAgregarProductos}
        />
        <FormSheet
          open={sheetProductoOpen}
          onOpenChange={setSheetProductoOpen}
          title="Nuevo Producto"
          description="Registra un nuevo producto."
          contentClassName="sm:max-w-[540px] px-6"
        >
          <ProductoForm
            productoEditado={null}
            categorias={[]}
            marcas={[]}
            onSubmit={() => {
              setSheetProductoOpen(false);
              cargarProductos();
            }}
            onCancel={() => setSheetProductoOpen(false)}
          />
        </FormSheet>
      </>
    );
  }

  return (
    <FormContainer
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      onCancel={onCancel}
      isEditing={!!pedidoEditado}
      submitText={{ save: "Guardar", update: "Actualizar" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
        <FieldWrapper label="Nro Pedido" id="nroPedido">
          <Input
            id="nroPedido"
            value={formData.nroPedido || "Se generará automáticamente"}
            readOnly
            className="bg-gray-100"
          />
        </FieldWrapper>

        <FieldWrapper label="Fecha" id="fecha">
          <Input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) => updateField("fecha", e.target.value)}
            required
            readOnly={!esEditable}
            className={!esEditable ? "bg-gray-100" : ""}
          />
        </FieldWrapper>

        <FieldWrapper label="Estado" id="estado">
          <select
            id="estado"
            value={formData.estado}
            onChange={(e) => updateField("estado", e.target.value)}
            className={`w-full h-9 rounded-md border px-3 text-sm ${
              !esEditable ? "bg-gray-100" : ""
            }`}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Enviado">Enviado</option>
            <option value="Respondido">Respondido</option>
          </select>
        </FieldWrapper>
      </div>
      {esEditable && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => cambiarVista("agregar-productos")}
            className="w-auto px-4 bg-zinc-500 text-white hover:bg-zinc-600"
          >
            Agregar productos
          </Button>
        </div>
      )}
      <PedidoItemsTable
        items={formData.items}
        onUpdateItem={updateItem}
        readOnly={!esEditable}
      />
    </FormContainer>
  );
}
