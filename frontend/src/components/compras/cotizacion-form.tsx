"use client";

import { useState, useEffect } from "react";
import { FormContainer } from "@/components/FormContainer";
import { CotizacionItemsTable } from "@/components/compras/cotizacion-item-table";
import { SeleccionarItemsPedidoModal } from "@/components/compras/seleccionar-items-pedidoModal";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Plus } from "lucide-react";
import {
    CotizacionFormState,
    CotizacionItemForm,
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

    const [busquedaPedido, setBusquedaPedido] = useState("");
    const [busquedaProveedor, setBusquedaProveedor] = useState("");

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
                console.error("Error al cargar maestros:", error);
                notify.error("Error", "No se pudieron inicializar los datos maestros.");
            } finally {
                setIsInitialLoading(false);
            }
        };

        cargarDatosMaestros();
    }, [cotizacionEditada]);

    useEffect(() => {
        if (!esEdicion && formData.solicitudCotizacionId && detallesOriginales.length === 0 && pedidosLista.length > 0) {
            cargarDetallesDelPedido(formData.solicitudCotizacionId);
        }
    }, [formData.solicitudCotizacionId, pedidosLista]);

    const cargarDetallesDelPedido = async (idPedido: string) => {
        setIsUpdatingItems(true);
        try {
            const resDetalles = await pedidosDetallesAPI.getAll(1, 1000);
            const listaDetalles = resDetalles.items || resDetalles || [];
            const filtrados = listaDetalles.filter((d: any) =>
                String(d.idPedidoCompra) === idPedido
            );

            setDetallesOriginales(filtrados);

            const itemsCargados: CotizacionItemForm[] = filtrados.map((d: any) => ({
                productoId: d.idProducto || d.productoId,
                descripcion: d.producto || d.descripcion || "Producto",
                cantidad: Number(d.cantidad),
                precioUnitario: 0,
                descuento: d.descuento ? Number(d.descuento) : 0,
            }));

            setFormData(prev => ({ ...prev, items: itemsCargados }));
        } catch (error) {
            console.error(error);
            notify.error("Error", "No se pudieron obtener los productos del pedido.");
        } finally {
            setIsUpdatingItems(false);
        }
    };

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

        await cargarDetallesDelPedido(val);
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
        } else if (field === "precioUnitario") {
            const precio = Number(value);
            // Si pone un valor negativo, lo forzamos a 0 y le avisamos al usuario
            if (precio < 0) {
                notify.error("Precio inválido", "El precio unitario no puede ser negativo.");
                newItems[index] = { ...itemActual, precioUnitario: 0 };
            } else {
                newItems[index] = { ...itemActual, precioUnitario: precio };
            }
        } else if (field === "descuento") {
            const desc = Number(value);
            if (desc < 0) {
                notify.error("Descuento inválido", "El descuento no puede ser negativo.");
                newItems[index] = { ...itemActual, descuento: 0 };
            } else {
                newItems[index] = { ...itemActual, descuento: desc };
            }
        } else {
            newItems[index] = { ...itemActual, [field]: value };
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const pedidosFiltrados = pedidosLista.filter(p =>
        String(p.numeroPedido || p.idPedidoCompra).toLowerCase().includes(busquedaPedido.toLowerCase())
    );

    const proveedoresFiltrados = proveedores.filter(prov =>
        prov.razonSocial.toLowerCase().includes(busquedaProveedor.toLowerCase()) ||
        (prov.ruc && prov.ruc.includes(busquedaProveedor))
    );

    return (
        <>
            <FormContainer
                onSubmit={(e) => {
                    e.preventDefault();

                    if (!formData.items || formData.items.length === 0) {
                        notify.error("Faltan datos", "La cotización debe poseer al menos un ítem cargado.");
                        return;
                    }

                    // VALIDACIÓN GLOBAL AL ENVIAR FORMULARIO
                    const tienePreciosInvalidos = formData.items.some(
                        (item) => item.precioUnitario <= 0
                    );

                    if (tienePreciosInvalidos) {
                        notify.error(
                            "Precios pendientes",
                            "Todos los ítems cargados deben tener un precio unitario mayor a 0."
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
                submitDisabled={isInitialLoading || isUpdatingItems}
            >
                {isUpdatingItems && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50 rounded-lg">
                        <div className="flex flex-col items-center gap-2 bg-card p-4 rounded-md shadow-md border">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Sincronizando ítems...</span>
                        </div>
                    </div>
                )}

                {/* UNA SOLA LÍNEA DE FLUJO HORIZONTAL CONTINUO */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border p-3 rounded-lg shadow-xs">

                    {/* SECCIÓN PEDIDO */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                        <label className="text-sm font-semibold text-foreground whitespace-nowrap min-w-[55px]">
                            Pedido:
                        </label>
                        <div className="flex flex-1 gap-2">
                            {!esEdicion && !deshabilitarSeleccion && (
                                <div className="relative flex items-center w-1/3 min-w-[110px]">
                                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar..."
                                        className="w-full h-9 pl-8 pr-2 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        value={busquedaPedido}
                                        onChange={(e) => setBusquedaPedido(e.target.value)}
                                    />
                                </div>
                            )}
                            <select
                                className="flex-1 h-9 rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary disabled:opacity-70 disabled:bg-muted"
                                value={String(formData.solicitudCotizacionId || "")}
                                onChange={(e) => handlePedidoChange(e.target.value)}
                                disabled={esEdicion || deshabilitarSeleccion}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {pedidosFiltrados.map((p) => (
                                    <option key={p.idPedidoCompra} value={String(p.idPedidoCompra)}>
                                        Nro: #{p.numeroPedido || p.idPedidoCompra}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* SEPARATOR / DIVISION VISUAL EN ESCRITORIO */}
                    <div className="hidden xl:block h-6 w-[1px] bg-border mx-2" />

                    {/* SECCIÓN PROVEEDOR */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                        <label className="text-sm font-semibold text-foreground whitespace-nowrap min-w-[70px]">
                            Proveedor:
                        </label>
                        <div className="flex flex-1 gap-2">
                            {!esEdicion && !deshabilitarSeleccion && (
                                <div className="relative flex items-center w-1/3 min-w-[110px]">
                                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="w-full h-9 pl-8 pr-2 text-xs bg-background border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        value={busquedaProveedor}
                                        onChange={(e) => setBusquedaProveedor(e.target.value)}
                                    />
                                </div>
                            )}
                            <select
                                className="flex-1 h-9 rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary disabled:opacity-70 disabled:bg-muted"
                                value={String(formData.proveedorId || "")}
                                onChange={(e) => setFormData(prev => ({ ...prev, proveedorId: e.target.value }))}
                                disabled={deshabilitarSeleccion || esEdicion}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {proveedoresFiltrados.map(prov => (
                                    <option key={prov.idProveedor} value={String(prov.idProveedor)}>
                                        {prov.razonSocial} {prov.ruc ? `(${prov.ruc})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>

                {/* Sección de la Tabla */}
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Ítems a Cotizar</h3>
                            <p className="text-xs text-muted-foreground">Precios y condiciones comerciales asignados por el proveedor</p>
                        </div>
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
                onConfirm={(seleccionados) => {
                    setFormData(prev => {
                        const itemsActualesMap = new Map(prev.items.map(i => [i.productoId, i]));
                        const nuevosItems = seleccionados.map((sel: any) => {
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
                }}
            />
        </>
    );
}