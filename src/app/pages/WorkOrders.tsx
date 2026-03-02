import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Wrench, Plus, Clock, AlertCircle, CheckCircle2, Truck } from 'lucide-react';

export default function WorkOrders() {
  const workOrders = useSelector((state: RootState) => state.workOrders.workOrders);
  const motorcycles = useSelector((state: RootState) => state.motorcycles.motorcycles);

  const pending = workOrders.filter(wo => wo.status === 'PENDING');
  const inProgress = workOrders.filter(wo => wo.status === 'IN_PROGRESS');
  const completed = workOrders.filter(wo => wo.status === 'COMPLETED');
  const delivered = workOrders.filter(wo => wo.status === 'DELIVERED');

  const getMotorcycle = (id: string) => motorcycles.find(m => m.id === id);

  const WorkOrderList = ({ orders }: { orders: typeof workOrders }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((wo) => {
        const moto = getMotorcycle(wo.motorcycleId);
        return (
          <Link key={wo.id} to={`/work-orders/${wo.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{wo.number}</p>
                    {moto && (
                      <p className="text-lg font-semibold mt-1">{moto.shopCode}</p>
                    )}
                  </div>
                  <Badge variant={wo.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {wo.status}
                  </Badge>
                </div>
                <p className="text-gray-700 mb-3 line-clamp-2">{wo.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(wo.startDate).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-lg">S/ {wo.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
          <p className="text-gray-600 mt-1">{workOrders.length} órdenes totales</p>
        </div>
        <Link to="/work-orders/new">
          <Button size="lg" className="h-12">
            <Plus className="w-5 h-5 mr-2" />
            Nueva OT
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendientes ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            En Proceso ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Terminados ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Entregados ({delivered.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pending.length === 0 ? (
            <Card className="p-12 text-center">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600">No hay OT pendientes</h3>
            </Card>
          ) : (
            <WorkOrderList orders={pending} />
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {inProgress.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600">No hay OT en proceso</h3>
            </Card>
          ) : (
            <WorkOrderList orders={inProgress} />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completed.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600">No hay OT completadas</h3>
            </Card>
          ) : (
            <WorkOrderList orders={completed} />
          )}
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          {delivered.length === 0 ? (
            <Card className="p-12 text-center">
              <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600">No hay OT entregadas</h3>
            </Card>
          ) : (
            <WorkOrderList orders={delivered} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
