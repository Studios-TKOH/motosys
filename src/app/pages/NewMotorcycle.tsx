import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createMotorcycle } from '../store/slices/motorcyclesSlice';
import { createCustomer, fetchCustomers } from '../store/slices/customersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function NewMotorcycle() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const customers = useSelector((state: RootState) => state.customers.customers);

  const [formData, setFormData] = useState({
    customerId: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    vinChasis: '',
    engineNumber: '',
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [showNewCustomer, setShowNewCustomer] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.brand || !formData.model) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    try {
      const result = await dispatch(createMotorcycle({
        customerId: formData.customerId,
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
        vinChasis: formData.vinChasis || undefined,
        engineNumber: formData.engineNumber || undefined,
      })).unwrap();

      toast.success(`Moto ${result.shopCode} creada exitosamente`);
      navigate(`/motorcycles/${result.id}`);
    } catch (error) {
      toast.error('Error al crear la moto');
      console.error(error);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Ingrese nombre y teléfono del cliente');
      return;
    }

    try {
      const result = await dispatch(createCustomer(newCustomer)).unwrap();
      setFormData({ ...formData, customerId: result.id });
      setShowNewCustomer(false);
      setNewCustomer({ name: '', phone: '', email: '' });
      toast.success('Cliente creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el cliente');
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/motorcycles')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Moto</h1>
          <p className="text-gray-600 mt-1">Registrar una nueva motocicleta en el sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewCustomer ? (
              <>
                <div>
                  <Label htmlFor="customer">Cliente *</Label>
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                    >
                      <SelectTrigger id="customer" className="flex-1">
                        <SelectValue placeholder="Seleccione un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewCustomer(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Nuevo
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg space-y-4">
                <h4 className="font-medium text-blue-900">Nuevo Cliente</h4>
                <div>
                  <Label htmlFor="customer-name">Nombre *</Label>
                  <Input
                    id="customer-name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Nombre completo"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">Teléfono *</Label>
                  <Input
                    id="customer-phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="999 999 999"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleCreateCustomer} className="flex-1">
                    Crear Cliente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewCustomer(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Moto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Honda, Yamaha, etc."
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="CBR 250R, XTZ 125, etc."
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  className="mt-2"
                  min="1900"
                  max="2100"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Rojo, Negro, etc."
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vin">VIN / Chasis</Label>
              <Input
                id="vin"
                value={formData.vinChasis}
                onChange={(e) => setFormData({ ...formData, vinChasis: e.target.value })}
                placeholder="Número de chasis"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="engine">Número de Motor</Label>
              <Input
                id="engine"
                value={formData.engineNumber}
                onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                placeholder="Número de motor"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" className="flex-1 h-14">
            <Save className="w-5 h-5 mr-2" />
            Guardar Moto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/motorcycles')}
            className="h-14"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
