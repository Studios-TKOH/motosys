import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDB, Part, StockBalance, generateId, InventoryMovement, InventoryMovementLine } from '../../lib/db';

interface PartsState {
  parts: Part[];
  stockBalances: Record<string, number>;
  loading: boolean;
  error: string | null;
}

const initialState: PartsState = {
  parts: [],
  stockBalances: {},
  loading: false,
  error: null,
};

export const fetchParts = createAsyncThunk('parts/fetchAll', async () => {
  const db = await getDB();
  const parts = await db.getAll('parts');
  const balances = await db.getAll('stockBalances');
  
  const stockMap: Record<string, number> = {};
  balances.forEach((balance) => {
    stockMap[balance.partId] = balance.quantity;
  });
  
  return { parts, stockBalances: stockMap };
});

export const createPart = createAsyncThunk(
  'parts/create',
  async (data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => {
    const db = await getDB();
    
    const part: Part = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.add('parts', part);
    
    // Initialize stock balance
    await db.put('stockBalances', {
      partId: part.id,
      quantity: 0,
      updatedAt: Date.now(),
    });
    
    return part;
  }
);

export const createInventoryMovement = createAsyncThunk(
  'parts/createMovement',
  async (data: {
    type: 'IN' | 'OUT' | 'ADJUST';
    reference?: string;
    notes?: string;
    lines: Array<{ partId: string; quantity: number; unitPrice?: number }>;
  }) => {
    const db = await getDB();
    const tx = db.transaction(['inventoryMovements', 'inventoryMovementLines', 'stockBalances'], 'readwrite');
    
    const movement: InventoryMovement = {
      id: generateId(),
      type: data.type,
      reference: data.reference,
      notes: data.notes,
      createdAt: Date.now(),
    };
    
    await tx.objectStore('inventoryMovements').add(movement);
    
    // Process each line and update stock
    for (const line of data.lines) {
      const movementLine: InventoryMovementLine = {
        id: generateId(),
        movementId: movement.id,
        partId: line.partId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      };
      
      await tx.objectStore('inventoryMovementLines').add(movementLine);
      
      // Update stock balance
      const balance = await tx.objectStore('stockBalances').get(line.partId);
      const currentQty = balance?.quantity || 0;
      
      let newQty = currentQty;
      if (data.type === 'IN') {
        newQty = currentQty + line.quantity;
      } else if (data.type === 'OUT') {
        newQty = currentQty - line.quantity;
      } else if (data.type === 'ADJUST') {
        newQty = line.quantity;
      }
      
      await tx.objectStore('stockBalances').put({
        partId: line.partId,
        quantity: Math.max(0, newQty),
        updatedAt: Date.now(),
      });
    }
    
    await tx.done;
    
    return movement;
  }
);

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = action.payload.parts;
        state.stockBalances = action.payload.stockBalances;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch parts';
      })
      .addCase(createPart.fulfilled, (state, action) => {
        state.parts.push(action.payload);
        state.stockBalances[action.payload.id] = 0;
      });
  },
});

export default partsSlice.reducer;
