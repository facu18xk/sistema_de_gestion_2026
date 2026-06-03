"use client";

import { useState, useEffect } from "react";
import { FormContainer } from "@/components/FormContainer";
import { FieldWrapper } from "@/components/FieldWrapper";
import { CotizacionItemsTable } from "@/components/compras/cotizacion-item-table";
import { SeleccionarItemsPedidoModal } from "@/components/compras/seleccionar-items-pedidoModal";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
    CotizacionFormState,
    CotizacionItemForm,
    PedidoDTO,
    Proveedor
} from "@/types/types";

import { pedidosDetallesAPI } from "@/services/pedidosDetallesAPI";
import { proveedoresAPI } from "@/services/proveedoresAPI";
import { notify } from "@/lib/notifications";

interface Props {
    cotizacionEditada?: CotizacionFormState | null;
    pedidosLista: any[];
    deshabilitarSeleccion?: boolean;
    onSubmit: (data: CotizacionFormState) => void;
    onCancel: () => void;
}

export function CotizacionForm({
    cotizacionEditada,
    pedidosLista,
    deshabilitarSeleccion = false,
    onSubmit,
    onCancel
}: Props) {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [detallesOriginales, setDetallesOriginales] = useState<any[]>([]);

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isUpdatingItems, setIsUpdatingItems] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState<CotizacionFormState>({
        solicitudCotizacionId: "",
        proveedorId: "",
        fecha: new Date().toISOString().split("T")[0],
        validaHasta: new Date().toISOString().split("T")[0],
        idEstado: 1,
        numeroPedido: 0,
        items: [],
    });

    const esEdicion = cotizacionEditada !== null && cotizacionEditada !== undefined;

    useEffect(() => {
        const cargarDatosMaestros = async () => {
            try {
                setIsInitialLoading(true);

                const resProv = await proveedoresAPI.getAll(1, 100);
                setProveedores(resProv.items || resProv || []);


                if (cotizacionEditada) {
                    setFormData(cotizacionEditada);


                    if (cotizacionEditada.solicitudCotizacionId) {
                        const resDetalles = await pedidosDetallesAPI.getAll(1, 1000);
                        const listaDetalles = resDetalles.items || resDetalles || [];
                        const filtrados = listaDetalles.filter((d: any) =>
                            String(d.idPedidoCompra) === String(cotizacionEditada.solicitudCotizacionId)
                        );
                        setDetallesOriginales(filtrados);
                    }
                }
            } catch (error) {
                console.error("Error al cargar maestros en el formulario:", error);
                notify.error("Error", "No se pudieron inicializar los datos de proveedores.");
            } finally {
                setIsInitialLoading(false);
            }
        };

        cargarDatosMaestros();
    }, [cotizacionEditada]);


    const handlePedidoChange = async (val: string) => {
        if (!val) {
            setFormData(prev => ({ ...prev, solicitudCotizacionId: "", items: [] }));
            setDetallesOriginales([]);
            return;
        }


        const pedidoSeleccionado = pedidosLista.find(p => String(p.idPedidoCompra) === val);
        const nroPedidoBase = pedidoSeleccionado ? Number(pedidoSeleccionado.numeroPedido) : 0;

        setFormData(prev => ({
            ...prev,
            solicitudCotizacionId: val,
            numeroPedido: nroPedidoBase,
            items: []
        }));

        setIsUpdatingItems(true);
        try {
            const resDetalles = await pedidosDetallesAPI.getAll(1, 1000);
            const listaDetalles = resDetalles.items || resDetalles || [];
            const filtrados = listaDetalles.filter((d: any) =>
                String(d.idPedidoCompra) === val
            );

            setDetallesOriginales(filtrados);


            const itemsCargados: CotizacionItemForm[] = filtrados.map((d: any) => ({
                productoId: d.idProducto || d.productoId,
                descripcion: d.producto || d.descripcion || "Producto",
                cantidad: Number(d.cantidad),
                precioUnitario: 0,
                descuento: 0,
            }));

            setFormData(prev => ({ ...prev, items: itemsCargados }));
            notify.success("Pedido vinculado", `Se cargaron ${filtrados.length} productos listos para cotizar.`);
        } catch (error) {
            console.error(error);
            notify.error("Error", "No se pudieron obtener los productos del pedido seleccionado.");
        } finally {
            setIsUpdatingItems(false);
        }
    };

    const confirmarSeleccionManual = (seleccionados: any[]) => {
        setFormData(prev => {
            const itemsActualesMap = new Map(
                prev.items.map(item => [item.productoId, item])
            );

            const nuevosItems: CotizacionItemForm[] = seleccionados.map((sel: any) => {
                const idProd = sel.idProducto || sel.productoId;
                const existe = itemsActualesMap.get(idProd);

                return {
                    idDetalle: existe?.idDetalle,
                    productoId: idProd,
                    descripcion: sel.producto || sel.descripcion || "Producto",
                    cantidad: existe ? existe.cantidad : Number(sel.cantidad || 1),
                    precioUnitario: existe ? existe.precioUnitario : 0,
                    descuento: existe ? existe.descuento : 0,
                };
            });

            return { ...prev, items: nuevosItems };
        });
    };

    const updateItemConValidacion = (index: number, field: keyof CotizacionItemForm, value: any) => {
        const newItems = [...formData.items];
        const itemActual = newItems[index];

        if (field === "cantidad") {
            const valorNumerico = Number(value);
            const original = detallesOriginales.find(d => (d.idProducto || d.productoId) === itemActual.productoId);
            const maxPermitido = original ? Number(original.cantidad) : valorNumerico;

            if (valorNumerico > maxPermitido) {
                notify.error("Cantidad excedida", `El pedido original solo requiere un máximo de ${maxPermitido} unidades.`);
                newItems[index] = { ...itemActual, cantidad: maxPermitido };
            } else {
                newItems[index] = { ...itemActual, cantidad: valorNumerico < 1 ? 1 : valorNumerico };
            }
        } else if (field === "precioUnitario" || field === "descuento") {
            newItems[index] = { ...itemActual, [field]: Number(value) };
        } else {
            newItems[index] = { ...itemActual, [field]: value };
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    return (
        <>
            <FormContainer
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!formData.items || formData.items.length === 0) {
                        notify.error("Faltan datos", "La cotización debe poseer al menos un ítem cargado.");
                        return;
                    }

                    const tienePreciosInvalidos = formData.items.some(
                        item => (Number(item.precioUnitario) || 0) < 1000
                    );

                    if (tienePreciosInvalidos) {
                        notify.error(
                            "Precios insuficientes",
                            "Todos los productos en la tabla deben tener un precio unitario mayor o igual a 1.000 Gs."
                        );
                        return;
                    }

                    onSubmit(formData);
                }}
                onCancel={onCancel}
                isEditing={esEdicion}
                submitText={{
                    save: "Guardar Cotización",
                    update: "Actualizar Cotización"
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <FieldWrapper label="Pedido de Compra Origen" id="solicitudCotizacionId">
                        <div className="relative">
                            <select
                                className={`w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary ${isUpdatingItems || deshabilitarSeleccion ? "opacity-50 pointer-events-none" : ""}`}
                                value={String(formData.solicitudCotizacionId || "")}
                                onChange={(e) => handlePedidoChange(e.target.value)}
                                disabled={esEdicion || deshabilitarSeleccion}
                                required
                            >
                                <option value="">Seleccione un pedido de compra...</option>
                                {pedidosLista.map((p) => (
                                    <option key={p.idPedidoCompra} value={String(p.idPedidoCompra)}>
                                        Pedido Nro: #{p.numeroPedido || p.idPedidoCompra} — Estado: {p.estado}
                                    </option>
                                ))}
                            </select>
                            {isUpdatingItems && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                    </FieldWrapper>

                    <FieldWrapper label="Proveedor que Cotiza" id="proveedorId">
                        <select
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                            value={String(formData.proveedorId || "")}
                            onChange={(e) => setFormData(prev => ({ ...prev, proveedorId: e.target.value }))}
                            disabled={deshabilitarSeleccion}
                            required
                        >
                            <option value="">Seleccione un proveedor...</option>
                            {proveedores.map(prov => (
                                <option key={prov.idProveedor} value={String(prov.idProveedor)}>
                                    {prov.razonSocial} {prov.ruc ? `(${prov.ruc})` : ""}
                                </option>
                            ))}
                        </select>
                    </FieldWrapper>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Ítems a Cotizar</h3>
                            <p className="text-xs text-muted-foreground">Precios y condiciones comerciales asignados por el proveedor</p>
                        </div>
                        <div className="flex gap-2">
                            {formData.solicitudCotizacionId && !deshabilitarSeleccion && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-primary border-primary hover:bg-primary/5 flex gap-2 h-8 text-xs"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Gestionar Ítems
                                </Button>
                            )}
                        </div>
                    </div>

                    <CotizacionItemsTable
                        items={formData.items}
                        onUpdateItem={updateItemConValidacion}
                        onDeleteItem={(index) => {
                            const newItems = formData.items.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                    />
                </div>
            </FormContainer>

            <SeleccionarItemsPedidoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                detallesPedido={detallesOriginales}
                itemsSeleccionados={formData.items}
                onConfirm={confirmarSeleccionManual}
            />
        </>
    );
}