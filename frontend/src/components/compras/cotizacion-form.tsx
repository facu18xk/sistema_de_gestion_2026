"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormContainer } from "@/components/FormContainer";
import { CotizacionItemsTable } from "@/components/compras/cotizacion-item-table";
import { SeleccionarItemsPedidoModal } from "@/components/compras/seleccionar-items-pedidoModal";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
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
    isReadOnly?: boolean;
    onSubmit: (data: CotizacionFormState) => void;
    onCancel: () => void;
}

export function CotizacionForm({
    cotizacionEditada,
    pedidosLista,
    deshabilitarSeleccion = false,
    isReadOnly = false,
    onSubmit,
    onCancel
}: Props) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isViewOnly = isReadOnly || searchParams.get("view") === "true";

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [detallesOriginales, setDetallesOriginales] = useState<any[]>([]);

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isUpdatingItems, setIsUpdatingItems] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5;

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
        const maxPagina = Math.ceil(formData.items.length / itemsPorPagina) || 1;
        if (paginaActual > maxPagina) {
            setPaginaActual(maxPagina);
        }
    }, [formData.items.length]);

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
                idCategoria: d.idCategoria ? Number(d.idCategoria) : undefined,
                descripcion: d.producto || d.descripcion || "Producto",
                cantidad: Number(d.cantidad),
                precioUnitario: 0,
                descuento: d.descuento ? Number(d.descuento) : 0,
            }));

            setFormData(prev => ({ ...prev, items: itemsCargados }));
            setPaginaActual(1);
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

    const updateItemConValidacion = (indexEnPagina: number, field: keyof CotizacionItemForm, value: any) => {
        const indexGlobal = (paginaActual - 1) * itemsPorPagina + indexEnPagina;
        const newItems = [...formData.items];
        const itemActual = newItems[indexGlobal];

        if (!itemActual) return;

        if (field === "cantidad") {
            const valorNumerico = Number(value);
            const original = detallesOriginales.find(d => (d.idProducto || d.productoId) === itemActual.productoId);
            const maxPermitido = original ? Number(original.cantidad) : valorNumerico;

            if (valorNumerico > maxPermitido) {
                notify.error("Cantidad excedida", `El pedido original solo requiere un máximo de ${maxPermitido} unidades.`);
                newItems[indexGlobal] = { ...itemActual, cantidad: maxPermitido };
            } else {
                newItems[indexGlobal] = { ...itemActual, cantidad: valorNumerico < 1 ? 1 : valorNumerico };
            }
        } else if (field === "precioUnitario") {
            const precio = Number(value);
            if (precio < 0) {
                notify.error("Precio inválido", "El precio unitario no puede ser negativo.");
                newItems[indexGlobal] = { ...itemActual, precioUnitario: 0 };
            } else {
                newItems[indexGlobal] = { ...itemActual, precioUnitario: precio };
            }
        } else if (field === "descuento") {
            const desc = Number(value);
            if (desc < 0) {
                notify.error("Descuento inválido", "El descuento no puede ser negativo.");
                newItems[indexGlobal] = { ...itemActual, descuento: 0 };
            } else {
                newItems[indexGlobal] = { ...itemActual, descuento: desc };
            }
        } else {
            newItems[indexGlobal] = { ...itemActual, [field]: value };
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const totalItems = formData.items.length;
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina) || 1;
    const indiceInicio = (paginaActual - 1) * itemsPorPagina;
    const itemsPaginados = formData.items.slice(indiceInicio, indiceInicio + itemsPorPagina);

    const renderFormContent = () => (
        <div className="flex flex-col gap-4 w-full relative">
            {isUpdatingItems && (
                <div className="grid grid-cols-4 gap-4 border p-4 rounded-lg bg-card items-end">
                    <div className="flex flex-col gap-1.5 col-span-1">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Sincronizando ítems...</span>
                    </div>
                </div>
            )}
            <div className="flex flex-row gap-4 border p-4 rounded-lg bg-card items-end w-full">

                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-foreground block mb-1.5">Pedido Asociado:</label>
                    <div className="w-full">
                        <Combobox
                            items={pedidosLista.map(p => ({
                                value: String(p.idPedidoCompra),
                                label: `Nro: #${p.numeroPedido || p.idPedidoCompra}`
                            }))}
                            value={String(formData.solicitudCotizacionId || "")}
                            onChange={handlePedidoChange}
                            placeholder="Buscar pedido..."
                            emptyText="No se encontraron pedidos."
                            disabled={esEdicion || deshabilitarSeleccion || isViewOnly}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-foreground block mb-1.5">Proveedor Asignado:</label>
                    <div className="w-full">
                        <Combobox
                            items={proveedores.map(p => ({
                                value: String(p.idProveedor),
                                label: `${p.razonSocial} ${p.ruc ? `(${p.ruc})` : ""}`
                            }))}
                            value={String(formData.proveedorId || "")}
                            onChange={(val) => setFormData(prev => ({ ...prev, proveedorId: val }))}
                            placeholder="Buscar proveedor..."
                            emptyText="No se encontraron proveedores."
                            disabled={deshabilitarSeleccion || esEdicion || isViewOnly}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[150px]">
                    <label className="text-xs font-bold text-foreground block mb-1.5">Fecha Emisión:</label>
                    <input
                        type="date"
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-muted font-medium"
                        value={formData.fecha}
                        onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                        disabled={!esEdicion || isViewOnly}
                        required
                    />
                </div>

                <div className="flex-1 min-w-[150px]">
                    <label className="text-xs font-bold text-foreground block mb-1.5">Estado Documento:</label>
                    <select
                        className="w-full h-9 rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:bg-muted font-bold text-primary"
                        value={Number(formData.idEstado || 1)}
                        onChange={(e) => setFormData(prev => ({ ...prev, idEstado: Number(e.target.value) }))}
                        disabled={!esEdicion || isViewOnly}
                        required
                    >
                        <option value={1}>1 - PENDIENTE</option>
                        <option value={2}>2 - APROBADO</option>
                        <option value={8}>8 - ANULADO</option>
                    </select>
                </div>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-sm relative">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Ítems a Cotizar</h3>
                        <p className="text-xs text-muted-foreground">Precios y condiciones comerciales asignados por el proveedor</p>
                    </div>
                    {!isViewOnly && formData.solicitudCotizacionId && !deshabilitarSeleccion && (
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
                    items={itemsPaginados}
                    allItems={formData.items}
                    onUpdateItem={updateItemConValidacion}
                    isViewOnly={isViewOnly}
                    onDeleteItem={(indexEnPagina) => {
                        if (isViewOnly) return;
                        const indexGlobal = (paginaActual - 1) * itemsPorPagina + indexEnPagina;
                        const newItems = formData.items.filter((_, i) => i !== indexGlobal);
                        setFormData(prev => ({ ...prev, items: newItems }));
                        const nuevaCantidadPaginas = Math.ceil(newItems.length / itemsPorPagina) || 1;
                        if (paginaActual > nuevaCantidadPaginas) {
                            setPaginaActual(nuevaCantidadPaginas);
                        }
                    }}
                />

                {totalItems > itemsPorPagina && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs select-none">
                        <span className="text-muted-foreground">
                            Mostrando <b>{indiceInicio + 1}</b> - <b>{Math.min(indiceInicio + itemsPorPagina, totalItems)}</b> de <b>{totalItems}</b> productos
                        </span>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs" disabled={paginaActual === 1} onClick={() => setPaginaActual(prev => prev - 1)}>Anterior</Button>
                            <div className="text-muted-foreground font-medium px-1">Página {paginaActual} de {totalPaginas}</div>
                            <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(prev => prev + 1)}>Siguiente</Button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );

    if (isInitialLoading) {
        return (
            <div className="flex h-48 items-center justify-center w-full col-span-full">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">Cargando datos...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {isViewOnly ? (
                <div className="flex flex-col gap-4 py-2 w-full">
                    {renderFormContent()}
                    <div className="flex justify-end gap-3 mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (Number(formData.idEstado) === 2) {
                                    router.push(`/compras/ordenes?idCotizacion=${formData.solicitudCotizacionId}`);
                                } else {
                                    onCancel();
                                }
                            }}
                            className="h-9 px-5 text-xs font-semibold bg-background border border-input shadow-xs hover:bg-muted cursor-pointer"
                        >
                            {Number(formData.idEstado) === 2 ? "Ir a Órdenes de Compra" : "Volver al Listado"}
                        </Button>
                    </div>
                </div>
            ) : (
                <FormContainer
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isViewOnly) return;
                        if (!formData.items || formData.items.length === 0) {
                            notify.error("Faltan datos", "La cotización debe poseer al menos un ítem cargado.");
                            return;
                        }
                        const tienePreciosInvalidos = formData.items.some((item) => item.precioUnitario <= 0);
                        if (tienePreciosInvalidos) {
                            notify.error("Precios pendientes", "Todos los ítems cargados deben tener un precio unitario mayor a 0.");
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
                    submitDisabled={isInitialLoading || isUpdatingItems || isViewOnly}
                >
                    {renderFormContent()}
                </FormContainer>
            )}

            <SeleccionarItemsPedidoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                detallesPedido={detallesOriginales}
                itemsSeleccionados={formData.items}
                onConfirm={(seleccionados) => {
                    if (isViewOnly) return;
                    setFormData(prev => {
                        const itemsActualesMap = new Map(prev.items.map(i => [i.productoId, i]));
                        const nuevosItems = seleccionados.map((sel: any) => {
                            const idProd = sel.idProducto || sel.productoId;
                            const existe = itemsActualesMap.get(idProd);
                            return {
                                idDetalle: existe?.idDetalle,
                                productoId: idProd,
                                idCategoria: sel.idCategoria ? Number(sel.idCategoria) : existe?.idCategoria,
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
