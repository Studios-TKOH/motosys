import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDB, Motorcycle, generateId, getNextSequence, formatShopCode } from '../../lib/db';

interface MotorcyclesState {
  motorcycles: Motorcycle[];
  loading: boolean;
  error: string | null;
}

const initialState: MotorcyclesState = {
  motorcycles: [],
  loading: false,
  error: null,
};

export const fetchMotorcycles = createAsyncThunk('motorcycles/fetchAll', async () => {
  const db = await getDB();
  return await db.getAll('motorcycles');
});

export const createMotorcycle = createAsyncThunk(
  'motorcycles/create',
  async (data: Omit<Motorcycle, 'id' | 'shopCode' | 'createdAt' | 'updatedAt'>) => {
    const db = await getDB();
    const seqNumber = await getNextSequence('motorcycle_shop_code');
    const shopCode = formatShopCode(seqNumber);
    
    const motorcycle: Motorcycle = {
      ...data,
      id: generateId(),
      shopCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.add('motorcycles', motorcycle);
    return motorcycle;
  }
);

export const updateMotorcycle = createAsyncThunk(
  'motorcycles/update',
  async ({ id, data }: { id: string; data: Partial<Motorcycle> }) => {
    const db = await getDB();
    const existing = await db.get('motorcycles', id);
    if (!existing) throw new Error('Motorcycle not found');
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: Date.now(),
    };
    
    await db.put('motorcycles', updated);
    return updated;
  }
);

const motorcyclesSlice = createSlice({
  name: 'motorcycles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMotorcycles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMotorcycles.fulfilled, (state, action) => {
        state.loading = false;
        state.motorcycles = action.payload;
      })
      .addCase(fetchMotorcycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch motorcycles';
      })
      .addCase(createMotorcycle.fulfilled, (state, action) => {
        state.motorcycles.push(action.payload);
      })
      .addCase(updateMotorcycle.fulfilled, (state, action) => {
        const index = state.motorcycles.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.motorcycles[index] = action.payload;
        }
      });
  },
});

export default motorcyclesSlice.reducer;
