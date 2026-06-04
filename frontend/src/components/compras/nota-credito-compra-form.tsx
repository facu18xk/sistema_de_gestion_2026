"use client";

import { useState, useEffect } from "react";
import { FormContainer } from "@/components/FormContainer";
import { FieldWrapper } from "@/components/FieldWrapper";
import { NotaCreditoItemsTable } from "@/components/compras/nota-credito-item-table";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notifications";
import { NotaCreditoFormState, NotaCreditoItemForm, FacturaCompra } from "@/types/types";

interface Props {
    notaCreditoEditada?: NotaCreditoFormState | null;
    facturasLista: FacturaCompra[]; // Pasado desde la página principal
    onSubmit: (data: NotaCreditoFormState) => void;
    onCancel: () => void;
    readOnly?: boolean;
}

export function NotaCreditoCompraForm({
    notaCreditoEditada,
    facturasLista,
    onSubmit,
    onCancel,
    readOnly = false
}: Props) {
    const [formData, setFormData] = useState<NotaCreditoFormState>({
        idFacturaCompra: "",
        idNotaDevolucionCompra: "0",
        timbrado: "",
        motivo: "",
        fechaEmision: new Date().toISOString().split("T")[0],
        items: [],
    });

    const esEdicion = notaCreditoEditada !== null && notaCreditoEditada !== undefined;

    useEffect(() => {
        if (notaCreditoEditada) {
            setFormData(notaCreditoEditada);
        }
    }, [notaCreditoEditada]);

    const handleFacturaChange = (idFacturaStr: string) => {
        const facturaSeleccionada = facturasLista.find(f => String(f.idFacturaCompra) === idFacturaStr);

        if (!facturaSeleccionada) {
            setFormData(prev => ({ ...prev, idFacturaCompra: "", items: [] }));
            return;
        }

        // Al seleccionar la factura, pre-cargamos sus detalles en la tabla de la nota de crédito
        const itemsCargados: NotaCreditoItemForm[] = (facturaSeleccionada.detalles ?? []).map(d => ({
            idProducto: d.idProducto,
            descripcion: d.producto?.descripcion || "Producto",
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.cantidad * d.precioUnitario
        }));

        setFormData(prev => ({
            ...prev,
            idFacturaCompra: idFacturaStr,
            items: itemsCargados
        }));

        notify.success("Factura vinculada", "Los ítems de la factura se han cargado para la nota de crédito.");
    };

    const updateField = (field: keyof NotaCreditoFormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateItem = (index: number, field: keyof NotaCreditoItemForm, value: number | string) => {
        const newItems = [...formData.items];
        const itemActual = newItems[index];

        newItems[index] = { ...itemActual, [field]: value };
        // Recalcular subtotal si cambia cantidad o precio
        if (field === "cantidad" || field === "precioUnitario") {
            newItems[index].subtotal = Number(newItems[index].cantidad) * Number(newItems[index].precioUnitario);
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            notify.error("Error", "La nota de crédito debe contener al menos un ítem.");
            return;
        }
        onSubmit(formData);
    };

    return (
        <FormContainer
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isEditing={esEdicion}
            submitText={{
                save: "Guardar Nota de Crédito",
                update: "Actualizar Nota de Crédito"
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                <FieldWrapper label="Factura Origen" id="idFacturaCompra">
                    <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-gray-100"
                        value={formData.idFacturaCompra}
                        onChange={(e) => handleFacturaChange(e.target.value)}
                        disabled={esEdicion || readOnly}
                        required
                    >
                        <option value="">Seleccione una factura...</option>
                        {facturasLista.map((f) => (
                            <option key={f.idFacturaCompra} value={String(f.idFacturaCompra)}>
                                Factura Nro: {f.nroComprobante} — Proveedor: {f.proveedor}
                            </option>
                        ))}
                    </select>
                </FieldWrapper>

                <FieldWrapper label="Timbrado" id="timbrado">
                    <Input
                        id="timbrado"
                        value={formData.timbrado}
                        onChange={(e) => updateField("timbrado", e.target.value)}
                        required
                        readOnly={readOnly}
                        placeholder="Nro. de Timbrado"
                        className={readOnly ? "bg-gray-100" : ""}
                    />
                </FieldWrapper>

                <FieldWrapper label="Fecha de Emisión" id="fechaEmision">
                    <Input
                        id="fechaEmision"
                        type="date"
                        value={formData.fechaEmision}
                        onChange={(e) => updateField("fechaEmision", e.target.value)}
                        required
                        readOnly={readOnly}
                        className={readOnly ? "bg-gray-100" : ""}
                    />
                </FieldWrapper>

                <FieldWrapper label="Motivo de la Nota de Crédito" id="motivo">
                    <Input
                        id="motivo"
                        value={formData.motivo}
                        onChange={(e) => updateField("motivo", e.target.value)}
                        required
                        readOnly={readOnly}
                        placeholder="Ej. Descuento, Error de facturación..."
                        className={`md:col-span-2 ${readOnly ? "bg-gray-100" : ""}`}
                    />
                </FieldWrapper>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm mt-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Ítems a Acreditar</h3>
                    <p className="text-xs text-muted-foreground">Modifique las cantidades o precios según el acuerdo comercial.</p>
                </div>

                <NotaCreditoItemsTable
                    items={formData.items}
                    onUpdateItem={updateItem}
                    onDeleteItem={(index) => {
                        const newItems = formData.items.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, items: newItems }));
                    }}
                    readOnly={readOnly}
                />
            </div>
        </FormContainer>
    );
}
