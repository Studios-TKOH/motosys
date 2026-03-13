import { useState, useEffect, useCallback } from 'react';
import { getDB, Sale } from '../lib/db';

export interface EnrichedSale extends Sale {
    customerName: string;
}

export function useSalesData() {
    const [sales, setSales] = useState<EnrichedSale[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            const db = await getDB();

            const allSales = await db.getAllFromIndex('sales', 'by-date');

            const recentSales = allSales.reverse();

            const enrichedSales: EnrichedSale[] = await Promise.all(
                recentSales.map(async (sale) => {
                    let customerName = 'Venta Rápida / Sin Cliente';

                    if (sale.customerId) {
                        const customer = await db.get('customers', sale.customerId);
                        if (customer) {
                            customerName = customer.name;
                        }
                    }

                    return {
                        ...sale,
                        customerName
                    };
                })
            );

            setSales(enrichedSales);
        } catch (error) {
            console.error("Error cargando el historial de ventas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSales();
        window.addEventListener('db-updated', fetchSales);
        return () => window.removeEventListener('db-updated', fetchSales);
    }, [fetchSales]);

    return { sales, loading, refetch: fetchSales };
}