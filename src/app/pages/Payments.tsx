import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { calculateLateFee } from '../store/slices/paymentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DollarSign, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export default function Payments() {
  const accounts = useSelector((state: RootState) => state.payments.accountsReceivable);
  const customers = useSelector((state: RootState) => state.customers.customers);

  const pending = accounts.filter(a => a.status === 'PENDING');
  const overdue = accounts.filter(a => a.status === 'OVERDUE');
  const paid = accounts.filter(a => a.status === 'PAID');

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  const AccountList = ({ accounts: accs }: { accounts: typeof accounts }) => (
    <div className="space-y-4">
      {accs.map((account) => {
        const customer = getCustomer(account.customerId);
        const lateFee = calculateLateFee(account);
        const daysOverdue = account.status === 'OVERDUE' 
          ? Math.floor((Date.now() - account.dueDate) / (1000 * 60 * 60 * 24))
          : 0;

        return (
          <Card key={account.id} className={account.status === 'OVERDUE' ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-lg font-semibold">{customer?.name || 'Cliente desconocido'}</p>
                    <Badge variant={account.status === 'PAID' ? 'default' : account.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                      {account.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">S/ {account.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pagado</p>
                      <p className="font-medium">S/ {account.paidAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Saldo</p>
                      <p className="font-bold text-lg">S/ {account.balance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vencimiento</p>
                      <p className="font-medium">{new Date(account.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {account.status === 'OVERDUE' && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-300">
                      <p className="text-red-800 font-medium">
                        ⚠️ Vencido hace {daysOverdue} días
                      </p>
                      {lateFee > 0 && (
                        <p className="text-red-700 mt-1">
                          Interés: S/ {lateFee} (S/ 10/día)
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {account.status !== 'PAID' && (
                  <Button>
                    Registrar Pago
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
        <p className="text-gray-600 mt-1">{accounts.length} cuentas totales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
            <Clock className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pending.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              S/ {pending.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vencidos</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdue.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              S/ {overdue.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pagados</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paid.length}</div>
            <p className="text-sm text-gray-500 mt-1">Completados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overdue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overdue">
            Vencidos ({overdue.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Pagados ({paid.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-6">
          {overdue.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-300" />
              <h3 className="text-xl font-medium text-gray-600">No hay pagos vencidos</h3>
              <p className="text-gray-500 mt-2">¡Excelente! Todos los pagos están al día</p>
            </Card>
          ) : (
            <AccountList accounts={overdue} />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pending.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600">No hay pagos pendientes</h3>
            </Card>
          ) : (
            <AccountList accounts={pending} />
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          {paid.length === 0 ? (
            <Card className="p-12 text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600">No hay pagos completados</h3>
            </Card>
          ) : (
            <AccountList accounts={paid} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
