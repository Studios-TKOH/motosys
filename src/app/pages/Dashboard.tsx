import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Bike, Wrench, ShoppingCart, DollarSign, Package, AlertTriangle,
  QrCode, Plus, Clock, CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const motorcycles = useSelector((state: RootState) => state.motorcycles.motorcycles);
  const workOrders = useSelector((state: RootState) => state.workOrders.workOrders);
  const sales = useSelector((state: RootState) => state.sales.sales);
  const accounts = useSelector((state: RootState) => state.payments.accountsReceivable);
  const parts = useSelector((state: RootState) => state.parts.parts);
  const stockBalances = useSelector((state: RootState) => state.parts.stockBalances);

  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'PENDING' || wo.status === 'IN_PROGRESS');
  const overdueAccounts = accounts.filter(a => a.status === 'OVERDUE');
  const criticalStock = parts.filter(p => (stockBalances[p.id] || 0) <= p.minStock);
  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.createdAt);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const quickActions = [
    { label: 'Escanear', icon: QrCode, path: '#', bg: 'bg-blue-500', onClick: () => {} },
    { label: 'Nueva Moto', icon: Bike, path: '/motorcycles/new', bg: 'bg-purple-500' },
    { label: 'Nuevo Mant.', icon: Wrench, path: '/work-orders/new', bg: 'bg-orange-500' },
    { label: 'Nueva Venta', icon: ShoppingCart, path: '/sales/new', bg: 'bg-green-500' },
    { label: 'Cobrar', icon: DollarSign, path: '/payments', bg: 'bg-yellow-500' },
    { label: 'KARDEX', icon: Package, path: '/kardex', bg: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <p className="text-gray-600 mt-1">Lunes, 2 de Marzo 2026</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const content = (
            <div className={`${action.bg} text-white p-6 rounded-xl text-center hover:opacity-90 transition-opacity cursor-pointer h-full flex flex-col items-center justify-center`}>
              <Icon className="w-10 h-10 mb-3" />
              <span className="font-medium">{action.label}</span>
            </div>
          );

          return action.path === '#' ? (
            <div key={action.label} onClick={action.onClick}>
              {content}
            </div>
          ) : (
            <Link key={action.label} to={action.path}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Motos</CardTitle>
            <Bike className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{motorcycles.length}</div>
            <p className="text-sm text-gray-500 mt-1">Registradas en sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">OT Pendientes</CardTitle>
            <Wrench className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingWorkOrders.length}</div>
            <p className="text-sm text-gray-500 mt-1">En proceso o pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ventas Hoy</CardTitle>
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaySales.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              S/ {todaySales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Deudas Vencidas</CardTitle>
            <DollarSign className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overdueAccounts.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              S/ {overdueAccounts.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical Stock */}
        {criticalStock.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Stock Crítico ({criticalStock.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-auto">
                {criticalStock.slice(0, 5).map((part) => (
                  <div key={part.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{part.name}</p>
                      <p className="text-sm text-gray-500">SKU: {part.sku}</p>
                    </div>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      {stockBalances[part.id] || 0}
                    </Badge>
                  </div>
                ))}
              </div>
              {criticalStock.length > 5 && (
                <Link to="/kardex">
                  <Button variant="link" className="w-full mt-2">
                    Ver todos →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Work Orders */}
        {pendingWorkOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Mantenimientos Pendientes ({pendingWorkOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-auto">
                {pendingWorkOrders.slice(0, 5).map((wo) => (
                  <Link key={wo.id} to={`/work-orders/${wo.id}`}>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium">{wo.number}</p>
                        <p className="text-sm text-gray-500">{wo.description}</p>
                      </div>
                      <Badge variant={wo.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                        {wo.status === 'IN_PROGRESS' ? 'En Proceso' : 'Pendiente'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
              {pendingWorkOrders.length > 5 && (
                <Link to="/work-orders">
                  <Button variant="link" className="w-full mt-2">
                    Ver todos →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overdue Payments */}
      {overdueAccounts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Pagos Vencidos ({overdueAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-auto">
              {overdueAccounts.slice(0, 5).map((account) => {
                const daysOverdue = Math.floor((Date.now() - account.dueDate) / (1000 * 60 * 60 * 24));
                const lateFee = daysOverdue * 10;
                
                return (
                  <div key={account.id} className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Cliente: [Ver detalles]</p>
                        <p className="text-sm text-gray-500">Vencido hace {daysOverdue} días</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">S/ {account.balance.toFixed(2)}</p>
                        {lateFee > 0 && (
                          <p className="text-sm text-red-500">+ S/ {lateFee} interés</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {overdueAccounts.length > 5 && (
              <Link to="/payments">
                <Button variant="link" className="w-full mt-2">
                  Ver todos →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
