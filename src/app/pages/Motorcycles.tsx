import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Bike, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function Motorcycles() {
  const motorcycles = useSelector((state: RootState) => state.motorcycles.motorcycles);
  const customers = useSelector((state: RootState) => state.customers.customers);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMotorcycles = motorcycles.filter((moto) => {
    const query = searchQuery.toLowerCase();
    return (
      moto.shopCode.toLowerCase().includes(query) ||
      moto.brand.toLowerCase().includes(query) ||
      moto.model.toLowerCase().includes(query) ||
      moto.color?.toLowerCase().includes(query)
    );
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Sin cliente';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Motos</h1>
          <p className="text-gray-600 mt-1">{motorcycles.length} motos registradas</p>
        </div>
        <Link to="/motorcycles/new">
          <Button size="lg" className="h-12">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Moto
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar por código, marca, modelo, color..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {filteredMotorcycles.length === 0 ? (
        <Card className="p-12 text-center">
          <Bike className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No hay motos registradas</h3>
          <p className="text-gray-500 mb-4">Comienza agregando una nueva moto al sistema</p>
          <Link to="/motorcycles/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Moto
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMotorcycles.map((moto) => (
            <Link key={moto.id} to={`/motorcycles/${moto.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {moto.shopCode}
                      </div>
                      <h3 className="text-xl font-semibold mb-1">
                        {moto.brand} {moto.model}
                      </h3>
                      <p className="text-gray-600">{getCustomerName(moto.customerId)}</p>
                    </div>
                    <Bike className="w-8 h-8 text-gray-400" />
                  </div>

                  <div className="space-y-2 text-sm">
                    {moto.year && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Año:</span>
                        <span className="font-medium">{moto.year}</span>
                      </div>
                    )}
                    {moto.color && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Color:</span>
                        <Badge variant="outline" className="capitalize">
                          {moto.color}
                        </Badge>
                      </div>
                    )}
                    {moto.engineNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Motor:</span>
                        <span className="font-mono text-xs">{moto.engineNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
