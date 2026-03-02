import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDB, AccountReceivable, Payment, generateId } from '../../lib/db';

interface PaymentsState {
  accountsReceivable: AccountReceivable[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  accountsReceivable: [],
  loading: false,
  error: null,
};

export const fetchAccountsReceivable = createAsyncThunk('payments/fetchAll', async () => {
  const db = await getDB();
  return await db.getAll('accountsReceivable');
});

export const createAccountReceivable = createAsyncThunk(
  'payments/createAccount',
  async (data: {
    saleId?: string;
    workOrderId?: string;
    customerId: string;
    totalAmount: number;
    paidAmount: number;
    dueDate: number;
  }) => {
    const db = await getDB();
    
    const balance = data.totalAmount - data.paidAmount;
    const now = Date.now();
    
    let status: AccountReceivable['status'] = 'PENDING';
    if (balance <= 0) status = 'PAID';
    else if (data.dueDate < now) status = 'OVERDUE';
    
    const account: AccountReceivable = {
      id: generateId(),
      saleId: data.saleId,
      workOrderId: data.workOrderId,
      customerId: data.customerId,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount,
      balance,
      dueDate: data.dueDate,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.add('accountsReceivable', account);
    return account;
  }
);

export const registerPayment = createAsyncThunk(
  'payments/register',
  async (data: {
    accountReceivableId: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'TRANSFER';
    notes?: string;
  }) => {
    const db = await getDB();
    const tx = db.transaction(['accountsReceivable', 'payments'], 'readwrite');
    
    const account = await tx.objectStore('accountsReceivable').get(data.accountReceivableId);
    if (!account) throw new Error('Account not found');
    
    const payment: Payment = {
      id: generateId(),
      accountReceivableId: data.accountReceivableId,
      amount: data.amount,
      method: data.method,
      notes: data.notes,
      createdAt: Date.now(),
    };
    
    await tx.objectStore('payments').add(payment);
    
    const newPaidAmount = account.paidAmount + data.amount;
    const newBalance = account.totalAmount - newPaidAmount;
    const now = Date.now();
    
    let status: AccountReceivable['status'] = 'PENDING';
    if (newBalance <= 0) status = 'PAID';
    else if (account.dueDate < now) status = 'OVERDUE';
    
    const updatedAccount: AccountReceivable = {
      ...account,
      paidAmount: newPaidAmount,
      balance: Math.max(0, newBalance),
      status,
      updatedAt: Date.now(),
    };
    
    await tx.objectStore('accountsReceivable').put(updatedAccount);
    await tx.done;
    
    return updatedAccount;
  }
);

export function calculateLateFee(account: AccountReceivable): number {
  if (account.status !== 'OVERDUE' || account.balance <= 0) return 0;
  
  const now = Date.now();
  const daysOverdue = Math.floor((now - account.dueDate) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysOverdue * 10); // S/10 per day
}

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountsReceivable.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountsReceivable.fulfilled, (state, action) => {
        state.loading = false;
        state.accountsReceivable = action.payload;
      })
      .addCase(fetchAccountsReceivable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      .addCase(createAccountReceivable.fulfilled, (state, action) => {
        state.accountsReceivable.push(action.payload);
      })
      .addCase(registerPayment.fulfilled, (state, action) => {
        const index = state.accountsReceivable.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.accountsReceivable[index] = action.payload;
        }
      });
  },
});

export default paymentsSlice.reducer;
