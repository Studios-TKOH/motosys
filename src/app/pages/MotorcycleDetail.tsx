import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Wrench, ShoppingCart, History, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

export default function MotorcycleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const motorcycle = useSelector((state: RootState) =>
    state.motorcycles.motorcycles.find((m) => m.id === id)
  );
  const customer = useSelector((state: RootState) =>
    state.customers.customers.find((c) => c.id === motorcycle?.customerId)
  );
  const workOrders = useSelector((state: RootState) =>
    state.workOrders.workOrders.filter((wo) => wo.motorcycleId === id)
  );
  const sales = useSelector((state: RootState) =>
    state.sales.sales.filter((s) => s.motorcycleId === id)
  );

  useEffect(() => {
    if (motorcycle && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        `moto:${motorcycle.shopCode}`,
        { width: 200, margin: 1 }
      );
    }
  }, [motorcycle]);

  if (!motorcycle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600">Moto no encontrada</h2>
        <Button onClick={() => navigate('/motorcycles')} className="mt-4">
          Volver a Motos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/motorcycles')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="text-5xl font-bold text-blue-600 mb-2">{motorcycle.shopCode}</div>
          <h1 className="text-3xl font-bold">
            {motorcycle.brand} {motorcycle.model}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Código Interno</p>
                <p className="text-2xl font-bold text-blue-600">{motorcycle.shopCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marca / Modelo</p>
                <p className="font-medium">{motorcycle.brand} {motorcycle.model}</p>
              </div>
              {motorcycle.year && (
                <div>
                  <p className="text-sm text-gray-500">Año</p>
                  <p className="font-medium">{motorcycle.year}</p>
                </div>
              )}
              {motorcycle.color && (
                <div>
                  <p className="text-sm text-gray-500">Color</p>
                  <Badge variant="outline" className="capitalize">{motorcycle.color}</Badge>
                </div>
              )}
              {motorcycle.vinChasis && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">VIN / Chasis</p>
                  <p className="font-mono">{motorcycle.vinChasis}</p>
                </div>
              )}
              {motorcycle.engineNumber && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Número de Motor</p>
                  <p className="font-mono">{motorcycle.engineNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Propietario</CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium text-lg">{customer.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                    {customer.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    )}
                  </div>
                  {customer.address && (
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Sin información del cliente</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Código QR
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <canvas ref={qrCanvasRef} className="mx-auto mb-3 border-2 border-gray-200 rounded" />
              <p className="text-sm text-gray-500">Escanear para acceso rápido</p>
              <p className="font-mono font-bold text-lg mt-2">{motorcycle.shopCode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={() => navigate('/work-orders/new')}>
                <Wrench className="w-4 h-4 mr-2" />
                Nuevo Mantenimiento
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/sales/new')}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Nueva Venta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Historial de Mantenimientos ({workOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay mantenimientos registrados</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {workOrders.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => navigate(`/work-orders/${wo.id}`)}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{wo.number}</p>
                      <Badge variant={wo.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {wo.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{wo.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(wo.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Historial de Ventas ({sales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {sales.map((sale) => (
                  <div key={sale.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{sale.number}</p>
                      <Badge variant={sale.status === 'PAID' ? 'default' : 'secondary'}>
                        {sale.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">S/ {sale.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
