import { useState, useEffect, useCallback } from 'react';
import { getDB, WorkOrder, Sale, AccountReceivable, Part } from '../lib/db';

export interface CriticalPart extends Part {
    currentStock: number;
}

export interface OverdueAccount extends AccountReceivable {
    customerName: string;
    daysOverdue: number;
    penaltyAmount: number;
}

export interface DashboardStats {
    totalMotorcycles: number;
    pendingWorkOrders: WorkOrder[];
    todaySalesCount: number;
    todaySalesTotal: number;
    overdueAccounts: OverdueAccount[];
    overdueTotal: number;
    criticalStock: CriticalPart[];
}

export function useDashboardData() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const db = await getDB();
            const now = Date.now();

            const totalMotorcycles = await db.count('motorcycles');

            const pending = await db.getAllFromIndex('workOrders', 'by-status', 'PENDING');
            const inProgress = await db.getAllFromIndex('workOrders', 'by-status', 'IN_PROGRESS');
            const pendingWorkOrders = [...pending, ...inProgress];

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const todaySales = await db.getAllFromIndex(
                'sales',
                'by-date',
                IDBKeyRange.bound(startOfDay.getTime(), endOfDay.getTime())
            );
            const todaySalesCount = todaySales.length;
            const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

            const pendingAccounts = await db.getAllFromIndex('accountsReceivable', 'by-status', 'PENDING');
            const officiallyOverdue = await db.getAllFromIndex('accountsReceivable', 'by-status', 'OVERDUE');

            const allUnpaid = [...pendingAccounts, ...officiallyOverdue];

            const overdueAccounts: OverdueAccount[] = [];
            let overdueTotal = 0;

            for (const acc of allUnpaid) {
                if (acc.dueDate < now) {
                    const customer = await db.get('customers', acc.customerId);

                    const diffTime = now - acc.dueDate;
                    const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const penaltyAmount = daysOverdue > 0 ? daysOverdue * 10 : 0; // S/ 10 por día

                    overdueAccounts.push({
                        ...acc,
                        customerName: customer ? customer.name : 'Cliente Eliminado/Desconocido',
                        daysOverdue,
                        penaltyAmount
                    });

                    overdueTotal += (acc.balance + penaltyAmount);
                }
            }

            overdueAccounts.sort((a, b) => b.daysOverdue - a.daysOverdue);

            const parts = await db.getAll('parts');
            const balances = await db.getAll('stockBalances');

            const balanceMap = new Map(balances.map(b => [b.partId, b.quantity]));

            const criticalStock: CriticalPart[] = parts
                .map(part => ({
                    ...part,
                    currentStock: balanceMap.get(part.id) || 0
                }))
                .filter(part => part.currentStock <= part.minStock);

            setStats({
                totalMotorcycles,
                pendingWorkOrders,
                todaySalesCount,
                todaySalesTotal,
                overdueAccounts,
                overdueTotal,
                criticalStock
            });

        } catch (error) {
            console.error("Error cargando el Dashboard desde IndexedDB:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        window.addEventListener('db-updated', fetchDashboardData);
        return () => window.removeEventListener('db-updated', fetchDashboardData);
    }, [fetchDashboardData]);

    return { stats, loading, refetch: fetchDashboardData };
}