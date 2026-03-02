import { Outlet } from 'react-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchMotorcycles } from '../store/slices/motorcyclesSlice';
import { fetchCustomers } from '../store/slices/customersSlice';
import { fetchParts } from '../store/slices/partsSlice';
import { fetchWorkOrders } from '../store/slices/workOrdersSlice';
import { fetchSales } from '../store/slices/salesSlice';
import { fetchAccountsReceivable } from '../store/slices/paymentsSlice';
import { seedDatabase } from '../lib/seed';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import OfflineBadge from './OfflineBadge';

export default function Root() {
  const dispatch = useDispatch<AppDispatch>();
  const fontSize = useSelector((state: RootState) => state.settings.fontSize);

  useEffect(() => {
    // Seed database on first load
    seedDatabase().then(() => {
      // Load all data on app start
      dispatch(fetchMotorcycles());
      dispatch(fetchCustomers());
      dispatch(fetchParts());
      dispatch(fetchWorkOrders());
      dispatch(fetchSales());
      dispatch(fetchAccountsReceivable());
    });
  }, [dispatch]);

  return (
    <div className={`flex h-screen bg-gray-50 ${fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
        <OfflineBadge />
      </div>
    </div>
  );
}