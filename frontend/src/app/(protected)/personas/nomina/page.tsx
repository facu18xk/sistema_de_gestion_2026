"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileText, Loader2, Printer, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/shared/data-table";
import { FormSheet } from "@/components/shared/form-sheet";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { conceptosSalariosAPI } from "@/services/conceptosSalariosAPI";
import { empleadosAPI } from "@/services/empleadosAPI";
import { empleadosConceptosMensualesAPI } from "@/services/empleadosConceptosMensualesAPI";
import { procesosPagosSalariosAPI } from "@/services/procesosPagosSalariosAPI";
import {
  ConceptoSalario,
  Empleado,
  EmpleadoConceptoMensual,
  PagoSalarioDetalle,
  ProcesoPagoSalario,
  ProcesoPagoSalarioSaveDTO,
  ReciboPagoSalario,
} from "@/types/types";
import { formatearFecha } from "@/utils/date-utils";
import { formatGuaranies } from "@/utils/money-format";
import { notify } from "@/lib/notifications";

const currentDate = new Date();

const emptyProcesoForm: ProcesoPagoSalarioSaveDTO = {
  periodoAnho: currentDate.getFullYear(),
  periodoMes: currentDate.getMonth() + 1,
  fechaPago: currentDate.toISOString().substring(0, 10),
};

const emptyCloseForm = {
  idModulo: "",
  idCuentaGastoSalarios: "",
  idCuentaPago: "",
  idCuentaIpsPagar: "",
  idCuentaOtrosEgresosPagar: "",
  descripcionAsiento: "",
};

type EmployeeGroup = {
  idEmpleado: number;
  empleado: string;
  ingresos: PagoSalarioDetalle[];
  egresos: PagoSalarioDetalle[];
  totalIngresos: number;
  totalEgresos: number;
  neto: number;
  hasBaseSalary: boolean;
  hasConcepts: boolean;
};

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function isClosed(estado: string) {
  return estado.toLowerCase() === "cerrado";
}

function isOpen(estado: string) {
  return estado.toLowerCase() === "abierto";
}

export default function NominaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isRecibosOpen, setIsRecibosOpen] = useState(false);
  const [procesos, setProcesos] = useState<ProcesoPagoSalario[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<ProcesoPagoSalario | null>(null);
  const [detalles, setDetalles] = useState<PagoSalarioDetalle[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoSalario[]>([]);
  const [conceptosMensuales, setConceptosMensuales] = useState<EmpleadoConceptoMensual[]>([]);
  const [recibos, setRecibos] = useState<ReciboPagoSalario[]>([]);
  const [formData, setFormData] = useState<ProcesoPagoSalarioSaveDTO>(emptyProcesoForm);
  const [closeForm, setCloseForm] = useState(emptyCloseForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [expandedEmployees, setExpandedEmployees] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const [resProcesos, resEmpleados, resConceptos, resConceptosMensuales] =
        await Promise.all([
          procesosPagosSalariosAPI.getAll(1, 100),
          empleadosAPI.getAll(1, 100),
          conceptosSalariosAPI.getAll(1, 100),
          empleadosConceptosMensualesAPI.getAll(1, 100),
        ]);
      setProcesos(resProcesos.items);
      setEmpleados(resEmpleados.items);
      setConceptos(resConceptos.items);
      setConceptosMensuales(resConceptosMensuales.items);

      if (selectedProcess) {
        const updated = resProcesos.items.find(
          (item) => item.idProcesoPagoSalario === selectedProcess.idProcesoPagoSalario,
        );
        setSelectedProcess(updated ?? null);
        if (updated) {
          await cargarDetalles(updated);
        }
      }
    } catch (error) {
      console.error("Error al cargar nómina:", error);
      notify.error("Error", "No se pudo obtener la información de nómina.");
    } finally {
      setIsLoading(false);
    }
  };

  const cargarDetalles = async (proceso: ProcesoPagoSalario) => {
    setSelectedProcess(proceso);
    try {
      const data = await procesosPagosSalariosAPI.getDetalles(proceso.idProcesoPagoSalario);
      setDetalles(data);
      setExpandedEmployees((prev) => (prev.length > 0 ? prev : data.map((item) => item.idEmpleado)));
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      notify.error("Error", "No se pudo obtener el detalle del proceso.");
      setDetalles([]);
    }
  };

  useEffect(() => {
    cargarPagina();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const procesosFiltrados = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return procesos;

    return procesos.filter(
      (item) =>
        `${item.periodoAnho}/${item.periodoMes}`.includes(query) ||
        item.estado.toLowerCase().includes(query) ||
        item.fechaPago.toLowerCase().includes(query),
    );
  }, [procesos, searchTerm]);

  const totalPages = Math.ceil(procesosFiltrados.length / itemsPerPage) || 1;
  const procesosVisibles = procesosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const salaryBaseConceptIds = useMemo(() => {
    return conceptos
      .filter((concepto) => concepto.esSalarioBase)
      .map((concepto) => concepto.idConceptoSalario);
  }, [conceptos]);

  const employeeGroups = useMemo<EmployeeGroup[]>(() => {
    const byEmployee = new Map<number, PagoSalarioDetalle[]>();
    detalles.forEach((detalle) => {
      const current = byEmployee.get(detalle.idEmpleado) ?? [];
      current.push(detalle);
      byEmployee.set(detalle.idEmpleado, current);
    });

    return Array.from(byEmployee.entries())
      .map(([idEmpleado, groupDetalles]) => {
        const ingresos = groupDetalles.filter((item) => item.tipo === "Ingreso");
        const egresos = groupDetalles.filter((item) => item.tipo === "Egreso");
        const empleadoMensual = conceptosMensuales.filter(
          (item) => item.idEmpleado === idEmpleado && item.activo,
        );
        const hasBaseSalary =
          groupDetalles.some((item) => salaryBaseConceptIds.includes(item.idConceptoSalario)) ||
          empleadoMensual.some((item) => salaryBaseConceptIds.includes(item.idConceptoSalario));

        return {
          idEmpleado,
          empleado: groupDetalles[0]?.empleado ?? "Empleado",
          ingresos,
          egresos,
          totalIngresos: ingresos.reduce((sum, item) => sum + item.monto, 0),
          totalEgresos: egresos.reduce((sum, item) => sum + item.monto, 0),
          neto:
            ingresos.reduce((sum, item) => sum + item.monto, 0) -
            egresos.reduce((sum, item) => sum + item.monto, 0),
          hasBaseSalary,
          hasConcepts: groupDetalles.length > 0,
        };
      })
      .filter((group) => employeeFilter === "all" || group.idEmpleado === Number(employeeFilter))
      .sort((a, b) => a.empleado.localeCompare(b.empleado));
  }, [conceptosMensuales, detalles, employeeFilter, salaryBaseConceptIds]);

  const empleadosSinConceptos = useMemo(() => {
    if (!selectedProcess) return [];
    const empleadosConDetalle = new Set(detalles.map((detalle) => detalle.idEmpleado));
    return empleados.filter((empleado) => !empleadosConDetalle.has(empleado.idEmpleado));
  }, [detalles, empleados, selectedProcess]);

  const handleCreateProcess = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await procesosPagosSalariosAPI.create(formData);
      notify.success("Registrado", "Proceso de nómina creado correctamente.");
      setIsSheetOpen(false);
      setFormData(emptyProcesoForm);
      await cargarPagina();
      await cargarDetalles(created);
    } catch (error) {
      console.error("Error al crear proceso:", error);
      notify.error("Error", "No se pudo crear el proceso de nómina.");
    }
  };

  const runProcessAction = async (
    process: ProcesoPagoSalario,
    action: "generar" | "verificar",
  ) => {
    setIsActionLoading(true);
    try {
      const updated =
        action === "generar"
          ? await procesosPagosSalariosAPI.generar(process.idProcesoPagoSalario)
          : await procesosPagosSalariosAPI.verificar(process.idProcesoPagoSalario);
      notify.success(
        action === "generar" ? "Generado" : "Verificado",
        action === "generar"
          ? "La nómina fue generada correctamente."
          : "La nómina fue verificada correctamente.",
      );
      setSelectedProcess(updated);
      await cargarPagina();
      await cargarDetalles(updated);
    } catch (error) {
      console.error(`Error al ${action} proceso:`, error);
      notify.error("Error", "No se pudo completar la acción.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCloseProcess = async () => {
    if (!selectedProcess) return;

    const requiredValues = [
      closeForm.idModulo,
      closeForm.idCuentaGastoSalarios,
      closeForm.idCuentaPago,
    ];
    if (requiredValues.some((value) => !value)) {
      notify.warning("Datos incompletos", "Complete módulo, cuenta de gasto y cuenta de pago.");
      return;
    }

    setIsActionLoading(true);
    try {
      const updated = await procesosPagosSalariosAPI.cerrar(
        selectedProcess.idProcesoPagoSalario,
        {
          idModulo: Number(closeForm.idModulo),
          idCuentaGastoSalarios: Number(closeForm.idCuentaGastoSalarios),
          idCuentaPago: Number(closeForm.idCuentaPago),
          idCuentaIpsPagar: closeForm.idCuentaIpsPagar
            ? Number(closeForm.idCuentaIpsPagar)
            : null,
          idCuentaOtrosEgresosPagar: closeForm.idCuentaOtrosEgresosPagar
            ? Number(closeForm.idCuentaOtrosEgresosPagar)
            : null,
          descripcionAsiento: closeForm.descripcionAsiento || null,
        },
      );
      notify.success("Cerrado", "Proceso de nómina cerrado correctamente.");
      setIsCloseOpen(false);
      setCloseForm(emptyCloseForm);
      await cargarPagina();
      await cargarDetalles(updated);
    } catch (error) {
      console.error("Error al cerrar proceso:", error);
      notify.error("Error", "No se pudo cerrar el proceso de nómina.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRecibos = async (process: ProcesoPagoSalario) => {
    if (!isClosed(process.estado)) {
      notify.warning("Proceso abierto", "Los recibos solo están disponibles para procesos cerrados.");
      return;
    }

    try {
      const data = await procesosPagosSalariosAPI.getRecibos(
        process.idProcesoPagoSalario,
        employeeFilter === "all" ? undefined : Number(employeeFilter),
      );
      setRecibos(data);
      setIsRecibosOpen(true);
    } catch (error) {
      console.error("Error al obtener recibos:", error);
      notify.error("Error", "No se pudieron obtener los recibos.");
    }
  };

  const toggleExpandedEmployee = (idEmpleado: number) => {
    setExpandedEmployees((prev) =>
      prev.includes(idEmpleado)
        ? prev.filter((id) => id !== idEmpleado)
        : [...prev, idEmpleado],
    );
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "RRHH", href: "/personas/empleados" },
          { label: "Nómina" },
        ]}
      />
      <PageHeader
        title="Nómina"
        buttonLabel="Nuevo Proceso"
        onButtonClick={() => setIsSheetOpen(true)}
      />

      <div className="my-4 flex max-w-md items-center print:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por periodo, estado o fecha..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9 w-full bg-white pl-9 pr-9 text-sm shadow-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-5">
          <DataTable
            caption="Procesos de pago salarial."
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            headerRow={
              <TableRow>
                <TableHead>Periodo</TableHead>
                <TableHead>Fecha pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead>Egresos</TableHead>
                <TableHead>Neto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            }
          >
            {procesosVisibles.map((process) => (
              <TableRow
                key={process.idProcesoPagoSalario}
                className={
                  selectedProcess?.idProcesoPagoSalario === process.idProcesoPagoSalario
                    ? "bg-muted/60"
                    : ""
                }
              >
                <TableCell>
                  {monthNames[process.periodoMes - 1]} {process.periodoAnho}
                </TableCell>
                <TableCell>{formatearFecha(process.fechaPago)}</TableCell>
                <TableCell>
                  <Badge variant={isClosed(process.estado) ? "activo" : "secondary"}>
                    {process.estado}
                  </Badge>
                </TableCell>
                <TableCell>{formatGuaranies(process.totalIngresos)}</TableCell>
                <TableCell>{formatGuaranies(process.totalEgresos)}</TableCell>
                <TableCell className="font-medium">{formatGuaranies(process.totalNeto)}</TableCell>
                <TableCell className="space-x-1 text-right">
                  <Button variant="outline" size="sm" onClick={() => cargarDetalles(process)}>
                    Revisar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isOpen(process.estado) || isActionLoading}
                    onClick={() => runProcessAction(process, "generar")}
                  >
                    Generar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isOpen(process.estado) || isActionLoading}
                    onClick={() => runProcessAction(process, "verificar")}
                  >
                    Verificar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isOpen(process.estado) || isActionLoading}
                    onClick={async () => {
                      await cargarDetalles(process);
                      setIsCloseOpen(true);
                    }}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isClosed(process.estado)}
                    onClick={() => handleRecibos(process)}
                  >
                    <FileText className="mr-1 size-3.5" />
                    Recibos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>

          <section className="rounded-md border bg-white p-4 shadow-sm print:hidden">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold">Revisión por empleado</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedProcess
                    ? `${monthNames[selectedProcess.periodoMes - 1]} ${selectedProcess.periodoAnho}`
                    : "Seleccione un proceso para revisar sus detalles."}
                </p>
              </div>
              <div className="w-full md:w-72">
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar empleado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Todos los empleados</SelectItem>
                    {empleados.map((empleado) => (
                      <SelectItem
                        key={empleado.idEmpleado}
                        value={empleado.idEmpleado.toString()}
                      >
                        {empleado.nombres} {empleado.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedProcess && empleadosSinConceptos.length > 0 && (
              <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
                Empleados sin conceptos en este proceso:{" "}
                {empleadosSinConceptos
                  .slice(0, 6)
                  .map((empleado) => `${empleado.nombres} ${empleado.apellidos}`)
                  .join(", ")}
                {empleadosSinConceptos.length > 6 ? "..." : ""}
              </div>
            )}

            <div className="grid gap-3">
              {employeeGroups.map((group) => {
                const expanded = expandedEmployees.includes(group.idEmpleado);
                return (
                  <div
                    key={group.idEmpleado}
                    className="rounded-md border bg-background"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 p-3 text-left"
                      onClick={() => toggleExpandedEmployee(group.idEmpleado)}
                    >
                      <div className="flex items-center gap-2">
                        {expanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                        <span className="font-medium">{group.empleado}</span>
                        {!group.hasBaseSalary && (
                          <Badge variant="destructive">Sin salario base</Badge>
                        )}
                        {!group.hasConcepts && <Badge variant="destructive">Sin conceptos</Badge>}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-right text-sm">
                        <span>Ing. {formatGuaranies(group.totalIngresos)}</span>
                        <span>Egr. {formatGuaranies(group.totalEgresos)}</span>
                        <span className="font-semibold">Neto {formatGuaranies(group.neto)}</span>
                      </div>
                    </button>
                    {expanded && (
                      <div className="grid gap-3 border-t p-3 md:grid-cols-2">
                        <ConceptList title="Ingresos" detalles={group.ingresos} />
                        <ConceptList title="Egresos" detalles={group.egresos} />
                      </div>
                    )}
                  </div>
                );
              })}
              {selectedProcess && employeeGroups.length === 0 && (
                <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No hay detalles para el filtro seleccionado.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Nuevo proceso de nómina"
      >
        <form onSubmit={handleCreateProcess} className="grid gap-4 px-2 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="periodoAnho">Año</Label>
              <Input
                id="periodoAnho"
                type="number"
                value={formData.periodoAnho}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    periodoAnho: Number(event.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="periodoMes">Mes</Label>
              <Input
                id="periodoMes"
                type="number"
                min="1"
                max="12"
                value={formData.periodoMes}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    periodoMes: Number(event.target.value),
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fechaPago">Fecha pago</Label>
            <Input
              id="fechaPago"
              type="date"
              value={formData.fechaPago}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, fechaPago: event.target.value }))
              }
              required
            />
          </div>
          <div className="mt-4 flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </FormSheet>

      <Dialog open={isCloseOpen} onOpenChange={setIsCloseOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cerrar proceso</DialogTitle>
            <DialogDescription>
              Complete las cuentas que usará el asiento automático de salarios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldNumber
                id="idModulo"
                label="Módulo"
                value={closeForm.idModulo}
                onChange={(value) => setCloseForm((prev) => ({ ...prev, idModulo: value }))}
              />
              <FieldNumber
                id="idCuentaGastoSalarios"
                label="Cuenta gasto salarios"
                value={closeForm.idCuentaGastoSalarios}
                onChange={(value) =>
                  setCloseForm((prev) => ({ ...prev, idCuentaGastoSalarios: value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FieldNumber
                id="idCuentaPago"
                label="Cuenta pago"
                value={closeForm.idCuentaPago}
                onChange={(value) => setCloseForm((prev) => ({ ...prev, idCuentaPago: value }))}
              />
              <FieldNumber
                id="idCuentaIpsPagar"
                label="Cuenta IPS"
                value={closeForm.idCuentaIpsPagar}
                onChange={(value) =>
                  setCloseForm((prev) => ({ ...prev, idCuentaIpsPagar: value }))
                }
              />
            </div>
            <FieldNumber
              id="idCuentaOtrosEgresosPagar"
              label="Cuenta otros egresos"
              value={closeForm.idCuentaOtrosEgresosPagar}
              onChange={(value) =>
                setCloseForm((prev) => ({ ...prev, idCuentaOtrosEgresosPagar: value }))
              }
            />
            <div className="grid gap-2">
              <Label htmlFor="descripcionAsiento">Descripción asiento</Label>
              <Input
                id="descripcionAsiento"
                value={closeForm.descripcionAsiento}
                onChange={(event) =>
                  setCloseForm((prev) => ({
                    ...prev,
                    descripcionAsiento: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCloseProcess} disabled={isActionLoading}>
              {isActionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRecibosOpen} onOpenChange={setIsRecibosOpen}>
        <DialogContent className="payroll-receipt-dialog sm:max-w-4xl">
          <DialogHeader className="print:hidden">
            <DialogTitle>Recibos de salario</DialogTitle>
            <DialogDescription>
              Original y duplicado por empleado del proceso cerrado.
            </DialogDescription>
          </DialogHeader>
          <div className="payroll-receipts max-h-[70vh] overflow-y-auto">
            {recibos.map((recibo, index) => (
              <ReciboView key={`${recibo.idEmpleado}-${recibo.copia}-${index}`} recibo={recibo} />
            ))}
            {recibos.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground print:hidden">
                No hay recibos para imprimir.
              </p>
            )}
          </div>
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setIsRecibosOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 size-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConceptList({
  title,
  detalles,
}: {
  title: string;
  detalles: PagoSalarioDetalle[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="grid gap-2">
        {detalles.map((detalle) => (
          <div
            key={detalle.idPagoSalarioDetalle}
            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
          >
            <div>
              <div className="font-medium">{detalle.conceptoSalario}</div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{detalle.esAutomatico ? "Automático" : "Manual"}</span>
                {detalle.deducibleIps && <span>Deducible IPS</span>}
                {detalle.observacion && <span>{detalle.observacion}</span>}
              </div>
            </div>
            <div className="text-right font-medium">{formatGuaranies(detalle.monto)}</div>
          </div>
        ))}
        {detalles.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Sin conceptos.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldNumber({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ReciboView({ recibo }: { recibo: ReciboPagoSalario }) {
  return (
    <article className="payroll-receipt mb-4 rounded-md border bg-white p-5 text-sm">
      <div className="mb-4 flex items-start justify-between gap-4 border-b pb-3">
        <div>
          <h2 className="text-lg font-semibold">McQueen Tires</h2>
          <p className="text-muted-foreground">Recibo de pago de salario</p>
        </div>
        <div className="text-right">
          <div className="font-semibold">{recibo.copia}</div>
          <div>
            {monthNames[recibo.periodoMes - 1]} {recibo.periodoAnho}
          </div>
          <div>{formatearFecha(recibo.fechaPago)}</div>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Empleado</div>
          <div className="font-medium">{recibo.empleado}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">CI / RUC</div>
          <div className="font-medium">
            {recibo.ci || "Sin CI"} / {recibo.ruc || "Sin RUC"}
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ReciboConceptTable title="Ingresos" detalles={recibo.ingresos} />
        <ReciboConceptTable title="Egresos" detalles={recibo.egresos} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3 text-right">
        <div>
          <div className="text-xs text-muted-foreground">Ingresos</div>
          <div className="font-semibold">{formatGuaranies(recibo.totalIngresos)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Egresos</div>
          <div className="font-semibold">{formatGuaranies(recibo.totalEgresos)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Neto a pagar</div>
          <div className="text-base font-bold">{formatGuaranies(recibo.netoPagar)}</div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-10 text-center text-xs">
        <div className="border-t pt-2">Firma empleado</div>
        <div className="border-t pt-2">Firma autorizado</div>
      </div>
    </article>
  );
}

function ReciboConceptTable({
  title,
  detalles,
}: {
  title: string;
  detalles: PagoSalarioDetalle[];
}) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="rounded-md border">
        {detalles.map((detalle) => (
          <div
            key={`${title}-${detalle.idPagoSalarioDetalle}`}
            className="flex justify-between gap-3 border-b px-3 py-2 last:border-b-0"
          >
            <span>{detalle.conceptoSalario}</span>
            <span className="font-medium">{formatGuaranies(detalle.monto)}</span>
          </div>
        ))}
        {detalles.length === 0 && (
          <div className="px-3 py-2 text-muted-foreground">Sin conceptos</div>
        )}
      </div>
    </div>
  );
}
