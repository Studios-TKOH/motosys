import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Plus, FileText } from 'lucide-react';

export default function Sales() {
  const sales = useSelector((state: RootState) => state.sales.sales);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-gray-600 mt-1">{sales.length} ventas registradas</p>
        </div>
        <Link to="/sales/new">
          <Button size="lg" className="h-12">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      {sales.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No hay ventas registradas</h3>
          <p className="text-gray-500 mb-4">Comienza registrando una nueva venta</p>
          <Link to="/sales/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Primera Venta
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.map((sale) => (
            <Card key={sale.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{sale.number}</p>
                    <Badge variant="outline" className="mt-2">{sale.type}</Badge>
                  </div>
                  <Badge variant={sale.status === 'PAID' ? 'default' : 'secondary'}>
                    {sale.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-xl">S/ {sale.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pagado:</span>
                    <span className="font-medium">S/ {sale.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500 pt-2">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Nota
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
