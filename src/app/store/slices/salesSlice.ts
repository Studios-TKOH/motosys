import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDB, Sale, SaleItem, generateId, getNextSequence, formatSaleNumber } from '../../lib/db';

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [],
  loading: false,
  error: null,
};

export const fetchSales = createAsyncThunk('sales/fetchAll', async () => {
  const db = await getDB();
  return await db.getAll('sales');
});

export const createSale = createAsyncThunk(
  'sales/create',
  async (data: {
    customerId?: string;
    motorcycleId?: string;
    items: Array<{
      type: 'PRODUCT' | 'SERVICE';
      itemId?: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    paidAmount: number;
  }) => {
    const db = await getDB();
    const seqNumber = await getNextSequence('sale_number');
    const number = formatSaleNumber(seqNumber);
    
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const hasProduct = data.items.some((item) => item.type === 'PRODUCT');
    const hasService = data.items.some((item) => item.type === 'SERVICE');
    
    let type: Sale['type'] = 'SERVICE';
    if (hasProduct && hasService) type = 'MIXED';
    else if (hasProduct) type = 'PRODUCT';
    
    let status: Sale['status'] = 'PENDING';
    if (data.paidAmount >= totalAmount) status = 'PAID';
    else if (data.paidAmount > 0) status = 'PARTIAL';
    
    const sale: Sale = {
      id: generateId(),
      customerId: data.customerId,
      motorcycleId: data.motorcycleId,
      number,
      type,
      totalAmount,
      paidAmount: data.paidAmount,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const tx = db.transaction(['sales', 'saleItems'], 'readwrite');
    
    await tx.objectStore('sales').add(sale);
    
    for (const item of data.items) {
      const saleItem: SaleItem = {
        id: generateId(),
        saleId: sale.id,
        type: item.type,
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      };
      await tx.objectStore('saleItems').add(saleItem);
    }
    
    await tx.done;
    
    return sale;
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales';
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.sales.push(action.payload);
      });
  },
});

export default salesSlice.reducer;
