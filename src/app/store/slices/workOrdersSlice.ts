import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDB, WorkOrder, WorkOrderService, WorkOrderPart, generateId, getNextSequence, formatWorkOrderNumber } from '../../lib/db';

interface WorkOrdersState {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkOrdersState = {
  workOrders: [],
  loading: false,
  error: null,
};

export const fetchWorkOrders = createAsyncThunk('workOrders/fetchAll', async () => {
  const db = await getDB();
  return await db.getAll('workOrders');
});

export const createWorkOrder = createAsyncThunk(
  'workOrders/create',
  async (data: {
    motorcycleId: string;
    customerId: string;
    description: string;
    services: Array<{ description: string; price: number }>;
    parts: Array<{ partId: string; quantity: number; unitPrice: number }>;
  }) => {
    const db = await getDB();
    const seqNumber = await getNextSequence('work_order_number');
    const number = formatWorkOrderNumber(seqNumber);
    
    const totalServices = data.services.reduce((sum, s) => sum + s.price, 0);
    const totalParts = data.parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    
    const workOrder: WorkOrder = {
      id: generateId(),
      motorcycleId: data.motorcycleId,
      customerId: data.customerId,
      number,
      status: 'PENDING',
      description: data.description,
      startDate: Date.now(),
      totalAmount: totalServices + totalParts,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const tx = db.transaction(['workOrders', 'workOrderServices', 'workOrderParts'], 'readwrite');
    
    await tx.objectStore('workOrders').add(workOrder);
    
    for (const service of data.services) {
      const woService: WorkOrderService = {
        id: generateId(),
        workOrderId: workOrder.id,
        description: service.description,
        price: service.price,
        completed: false,
      };
      await tx.objectStore('workOrderServices').add(woService);
    }
    
    for (const part of data.parts) {
      const woPart: WorkOrderPart = {
        id: generateId(),
        workOrderId: workOrder.id,
        partId: part.partId,
        quantity: part.quantity,
        unitPrice: part.unitPrice,
      };
      await tx.objectStore('workOrderParts').add(woPart);
    }
    
    await tx.done;
    
    return workOrder;
  }
);

export const updateWorkOrderStatus = createAsyncThunk(
  'workOrders/updateStatus',
  async ({ id, status }: { id: string; status: WorkOrder['status'] }) => {
    const db = await getDB();
    const workOrder = await db.get('workOrders', id);
    if (!workOrder) throw new Error('Work order not found');
    
    const updated = {
      ...workOrder,
      status,
      updatedAt: Date.now(),
      ...(status === 'COMPLETED' && { completionDate: Date.now() }),
      ...(status === 'DELIVERED' && { deliveryDate: Date.now() }),
    };
    
    await db.put('workOrders', updated);
    return updated;
  }
);

const workOrdersSlice = createSlice({
  name: 'workOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.workOrders = action.payload;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch work orders';
      })
      .addCase(createWorkOrder.fulfilled, (state, action) => {
        state.workOrders.push(action.payload);
      })
      .addCase(updateWorkOrderStatus.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex((wo) => wo.id === action.payload.id);
        if (index !== -1) {
          state.workOrders[index] = action.payload;
        }
      });
  },
});

export default workOrdersSlice.reducer;
