"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormContainer } from "@/components/FormContainer";
import { FieldWrapper } from "@/components/FieldWrapper";
import { PedidoItemsTable } from "@/components/compras/pedido-item-table";
import {
  AgregarProductosModal,
  ProductoSeleccionable,
  ProductoSeleccionadoParaPedido,
} from "@/components/compras/agregar-producto-view";
import { productosAPI } from "@/services/productosAPI";
import { FormSheet } from "@/components/shared/form-sheet";
import { ProductoForm } from "@/components/stock/producto-form";

export interface PedidoItem {
  id: number | string;
  idProducto: number;
  idCategoria: number;
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
}

export function PedidoForm({
  pedidoEditado,
  onSubmit,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<Pedido>({
    nroPedido: "",
    fecha: new Date().toISOString().split("T")[0],
    estado: "Pendiente",
    items: [],
  });

  const [productos, setProductos] = useState<ProductoSeleccionable[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isModalProductosOpen, setIsModalProductosOpen] = useState(false);
  const [sheetProductoOpen, setSheetProductoOpen] = useState(false);

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
        idCategoria: p.idCategoria,
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
    items[index] = { ...items[index], [field]: value } as PedidoItem;
    setFormData((prev) => ({ ...prev, items }));
  };

  const handleDeleteItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleAgregarProductos = (
    productosSeleccionados: ProductoSeleccionadoParaPedido[],
  ) => {
    setFormData((prev) => {
      const nuevosItems: PedidoItem[] = productosSeleccionados.map((nuevo) => {
        const itemAnterior = prev.items.find(i => i.idProducto === nuevo.id);

        return {
          id: itemAnterior ? itemAnterior.id : (Date.now() + nuevo.id),
          idProducto: nuevo.id,
          idCategoria: nuevo.idCategoria,
          cantidad: nuevo.cantidad,
          descripcion: nuevo.descripcion,
          categoria: nuevo.categoria,
          esNuevo: !itemAnterior,
        };
      });

      return { ...prev, items: nuevosItems };
    });

    setIsModalProductosOpen(false);
  };

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
            className={`w-full h-9 rounded-md border px-3 text-sm ${!esEditable ? "bg-gray-100" : ""
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
            onClick={() => setIsModalProductosOpen(true)}
            className="w-auto px-4 bg-zinc-400 text-white hover:bg-zinc-500"
          >
            Agregar productos
          </Button>
        </div>
      )}

      <PedidoItemsTable
        items={formData.items}
        onUpdateItem={updateItem}
        onDeleteItem={handleDeleteItem}
        readOnly={!esEditable}
      />

      {/* Si AgregarProductosModal está por fuera o por dentro de un Sheet del componente superior, 
        se renderizará de acuerdo a los cambios del w-[95vw] y md:max-w-5xl aplicados previamente.
      */}
      <AgregarProductosModal
        isOpen={isModalProductosOpen}
        onClose={() => setIsModalProductosOpen(false)}
        productos={productos}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsExistentes={formData.items}
        onPageChange={setCurrentPage}
        onNuevoProducto={() => setSheetProductoOpen(true)}
        onCargarProductos={handleAgregarProductos}
      />

      {/* MODIFICACIÓN AQUÍ: Le pasamos propiedades dinámicas a FormSheet para que 
        cuando se registre un "Nuevo Producto" de raíz, use todo el ancho lateral 
        cómodo disponible (incrementado de sm:max-w-[540px] a sm:max-w-[800px] o w-[50vw]).
      */}
      <FormSheet
        open={sheetProductoOpen}
        onOpenChange={setSheetProductoOpen}
        title="Nuevo Producto"
        description="Registra un nuevo producto."
        contentClassName="w-full sm:max-w-[700px] md:max-w-[850px] px-6 overflow-y-auto"
        side="right"
      >
        <ProductoForm
          onRefreshData={cargarProductos}
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
    </FormContainer>
  );
}