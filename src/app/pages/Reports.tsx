import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart3, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const motorcycles = useSelector((state: RootState) => state.motorcycles.motorcycles);
  const workOrders = useSelector((state: RootState) => state.workOrders.workOrders);
  const sales = useSelector((state: RootState) => state.sales.sales);
  const accounts = useSelector((state: RootState) => state.payments.accountsReceivable);
  const parts = useSelector((state: RootState) => state.parts.parts);
  const stockBalances = useSelector((state: RootState) => state.parts.stockBalances);

  // Color distribution
  const colorCounts = motorcycles.reduce((acc, moto) => {
    const color = moto.color || 'Sin color';
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colorData = Object.entries(colorCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  // Work order status
  const woStatusData = [
    { name: 'Pendiente', value: workOrders.filter(wo => wo.status === 'PENDING').length },
    { name: 'En Proceso', value: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length },
    { name: 'Completado', value: workOrders.filter(wo => wo.status === 'COMPLETED').length },
    { name: 'Entregado', value: workOrders.filter(wo => wo.status === 'DELIVERED').length },
  ];

  // Sales last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const salesByDay = last7Days.map((date) => {
    const daySales = sales.filter((s) => {
      const saleDate = new Date(s.createdAt);
      return saleDate.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
      ventas: daySales.length,
      monto: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
    };
  });

  const criticalStock = parts.filter(p => (stockBalances[p.id] || 0) <= p.minStock);
  const overdueAccounts = accounts.filter(a => a.status === 'OVERDUE');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
        <p className="text-gray-600 mt-1">Visualización de datos del taller</p>
      </div>

      {/* Critical alerts */}
      {(criticalStock.length > 0 || overdueAccounts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalStock.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Stock Crítico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {criticalStock.length}
                </div>
                <p className="text-orange-700">productos por debajo del stock mínimo</p>
              </CardContent>
            </Card>
          )}

          {overdueAccounts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Deudas Vencidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {overdueAccounts.length}
                </div>
                <p className="text-red-700">
                  Total: S/ {overdueAccounts.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="workorders">OT</TabsTrigger>
          <TabsTrigger value="motorcycles">Motos</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Últimos 7 Días</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="monto" fill="#3b82f6" name="Monto (S/)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sales.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Monto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  S/ {sales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  S/ {sales.length > 0 ? (sales.reduce((sum, s) => sum + s.totalAmount, 0) / sales.length).toFixed(2) : '0.00'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workorders" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Órdenes de Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={woStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total OT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pendientes/En Proceso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {workOrders.filter(wo => wo.status === 'PENDING' || wo.status === 'IN_PROGRESS').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="motorcycles" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Color</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={colorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {colorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Motos Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{motorcycles.length}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{parts.length}</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Stock Crítico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{criticalStock.length}</div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Sin Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {parts.filter(p => (stockBalances[p.id] || 0) === 0).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {criticalStock.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Productos con Stock Crítico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {criticalStock.map((part) => (
                    <div key={part.id} className="bg-white p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{part.name}</p>
                        <p className="text-sm text-gray-500">SKU: {part.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">
                          {stockBalances[part.id] || 0}
                        </p>
                        <p className="text-sm text-gray-500">Min: {part.minStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
