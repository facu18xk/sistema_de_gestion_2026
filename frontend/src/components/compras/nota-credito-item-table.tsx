"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { NotaCreditoItemForm } from "@/types/types";

interface Props {
    items: NotaCreditoItemForm[];
    onUpdateItem: (index: number, field: keyof NotaCreditoItemForm, value: number | string) => void;
    onDeleteItem: (index: number) => void;
    readOnly?: boolean;
}

export function NotaCreditoItemsTable({ items, onUpdateItem, onDeleteItem, readOnly = false }: Props) {
    const totalGeneral = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

    return (
        <div className="w-full overflow-x-auto rounded-md border bg-white">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[80px]">ID Prod.</TableHead>
                        <TableHead>Descripción del Producto</TableHead>
                        <TableHead className="w-[120px] text-center">Cantidad</TableHead>
                        <TableHead className="w-[150px] text-center">Precio Unit. (Gs.)</TableHead>
                        <TableHead className="w-[150px] text-right">Subtotal (Gs.)</TableHead>
                        {!readOnly && <TableHead className="w-[50px]"></TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={readOnly ? 5 : 6} className="h-24 text-center text-muted-foreground italic">
                                No hay productos asignados a la nota de crédito.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item, index) => {
                            const subtotal = item.cantidad * item.precioUnitario;

                            return (
                                <TableRow key={`${item.idProducto}-${index}`} className="hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {item.idProducto}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-slate-700">{item.descripcion}</span>
                                    </TableCell>
                                    <TableCell>
                                        {readOnly ? (
                                            <div className="text-center">{item.cantidad}</div>
                                        ) : (
                                            <Input
                                                type="number"
                                                min={1}
                                                value={item.cantidad || ""}
                                                onChange={(e) => onUpdateItem(index, "cantidad", Number(e.target.value))}
                                                className="w-20 mx-auto h-8 text-center"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {readOnly ? (
                                            <div className="text-center">{item.precioUnitario.toLocaleString("es-PY")}</div>
                                        ) : (
                                            <Input
                                                type="number"
                                                min={0}
                                                value={item.precioUnitario || ""}
                                                onChange={(e) => onUpdateItem(index, "precioUnitario", Number(e.target.value))}
                                                className="w-32 mx-auto h-8 text-right"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-slate-900">
                                        {subtotal.toLocaleString("es-PY")}
                                    </TableCell>
                                    {!readOnly && (
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteItem(index)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 size-8"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
                {items.length > 0 && (
                    <tfoot>
                        <TableRow className="bg-slate-50/80 font-bold">
                            <TableCell colSpan={4} className="text-right text-slate-700 uppercase text-xs tracking-wider">
                                Total Nota de Crédito:
                            </TableCell>
                            <TableCell className="text-right text-lg text-primary">
                                {totalGeneral.toLocaleString("es-PY")} <span className="text-xs ml-1">Gs.</span>
                            </TableCell>
                            {!readOnly && <TableCell />}
                        </TableRow>
                    </tfoot>
                )}
            </Table>
        </div>
    );
}