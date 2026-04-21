import { PedidoDTO, PedidoSaveDTO } from "@/types/types";

// 🔹 Mock en memoria (mutable)
let mockPedidos: PedidoDTO[] = [
    {
        id: 1,
        idProveedor: 101,
        nombreProveedor: "Distribuidora Gamma",
        fecha: "2026-04-20",
        total: 150.5,
        estado: "Pendiente",
        nroCotizacion: "COT-001",
        items: []
    },
    {
        id: 2,
        idProveedor: 102,
        nombreProveedor: "TecnoSuministros S.A.",
        fecha: "2026-04-21",
        total: 2300,
        estado: "Completado",
        nroCotizacion: "COT-002",
        items: []
    }
];

export const pedidosAPI = {

    getAll: async (): Promise<PedidoDTO[]> => {
        return Promise.resolve(mockPedidos);
    },

    getById: async (id: number): Promise<PedidoDTO> => {
        const pedido = mockPedidos.find(p => p.id === id);
        if (!pedido) throw new Error("Pedido no encontrado");
        return Promise.resolve(pedido);
    },

    create: async (data: PedidoSaveDTO): Promise<PedidoDTO> => {
        const nuevo: PedidoDTO = {
            ...data,
            id: Date.now(),
            estado: "Pendiente",
            nombreProveedor: "Proveedor Mock" // luego backend real
        };

        mockPedidos.push(nuevo);
        console.log("CREADO:", nuevo);

        return Promise.resolve(nuevo);
    },

    update: async (id: number, data: Partial<PedidoSaveDTO>): Promise<PedidoDTO> => {
        const index = mockPedidos.findIndex(p => p.id === id);
        if (index === -1) throw new Error("Pedido no encontrado");

        mockPedidos[index] = {
            ...mockPedidos[index],
            ...data
        };

        return Promise.resolve(mockPedidos[index]);
    },

    delete: async (id: number) => {
        mockPedidos = mockPedidos.filter(p => p.id !== id);
        return Promise.resolve({ status: 200 });
    }
};