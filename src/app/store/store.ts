import { configureStore } from '@reduxjs/toolkit';
import motorcyclesReducer from './slices/motorcyclesSlice';
import customersReducer from './slices/customersSlice';
import partsReducer from './slices/partsSlice';
import workOrdersReducer from './slices/workOrdersSlice';
import salesReducer from './slices/salesSlice';
import paymentsReducer from './slices/paymentsSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    motorcycles: motorcyclesReducer,
    customers: customersReducer,
    parts: partsReducer,
    workOrders: workOrdersReducer,
    sales: salesReducer,
    payments: paymentsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
