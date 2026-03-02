import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDB, Customer, generateId } from '../../lib/db';

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  loading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk('customers/fetchAll', async () => {
  const db = await getDB();
  return await db.getAll('customers');
});

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const db = await getDB();
    
    const customer: Customer = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.add('customers', customer);
    return customer;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }: { id: string; data: Partial<Customer> }) => {
    const db = await getDB();
    const existing = await db.get('customers', id);
    if (!existing) throw new Error('Customer not found');
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: Date.now(),
    };
    
    await db.put('customers', updated);
    return updated;
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      });
  },
});

export default customersSlice.reducer;
