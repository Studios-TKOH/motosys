import { Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState, AppDispatch } from "../store/store";
import { createPart, fetchParts } from "../store/slices/partsSlice"; // Importamos acciones

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  ArrowRightLeft,
  FileEdit,
  Save,
} from "lucide-react";
import { useState } from "react";

// Tipado para el formulario de Nuevo Producto
type NewPartFormValues = {
  sku: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number | string;
  minStock: number | string;
};

export default function Kardex() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const parts = useSelector((state: RootState) => state.parts.parts);
  const stockBalances: any = useSelector(
    (state: RootState) => (state.parts as any).stockBalances,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Estado para controlar el modal de nuevo producto
  const [isNewPartModalOpen, setIsNewPartModalOpen] = useState(false);

  // Configuración del formulario
  const form = useForm<NewPartFormValues>({
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "GENERAL", // Categoría por defecto
      unitPrice: "",
      minStock: 5, // Stock mínimo por defecto
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = form;

  // FIX: Función ultra-segura para obtener el stock
  const getAvailableStock = (partId: string) => {
    if (!stockBalances) return 0;
    if (Array.isArray(stockBalances)) {
      const balance = stockBalances.find((sb: any) => sb.partId === partId);
      return balance ? parseFloat(String(balance.quantity)) : 0;
    }
    if (typeof stockBalances === "object") {
      const balance = stockBalances[partId];
      if (balance) return parseFloat(String(balance.quantity ?? balance ?? 0));
    }
    return 0;
  };

  const filteredParts = parts.filter((part) => {
    const query = searchQuery.toLowerCase();
    return (
      part.name.toLowerCase().includes(query) ||
      part.sku.toLowerCase().includes(query) ||
      part.description?.toLowerCase().includes(query)
    );
  });

  const criticalStock = parts.filter(
    (p) => getAvailableStock(p.id) > 0 && getAvailableStock(p.id) <= p.minStock,
  );
  const outOfStock = parts.filter((p) => getAvailableStock(p.id) <= 0);

  // Función para manejar la creación del nuevo producto
  const onSubmitNewPart = async (data: NewPartFormValues) => {
    try {
      // Validar que el SKU no exista ya
      const skuExists = parts.some(
        (p) => p.sku.toUpperCase() === data.sku.toUpperCase(),
      );
      if (skuExists) {
        toast.error("SKU Duplicado", {
          description: "Ya existe un producto con ese código SKU.",
        });
        return;
      }

      const payload = {
        sku: data.sku.toUpperCase(),
        name: data.name,
        description: data.description,
        category: data.category,
        unitPrice: parseFloat(String(data.unitPrice)),
        minStock: parseInt(String(data.minStock), 10),
      };

      await dispatch(createPart(payload)).unwrap();
      await dispatch(fetchParts()).unwrap(); // Refrescar stock (inicializa en 0)

      toast.success("Producto Creado", {
        description: `${data.name} añadido al catálogo.`,
      });
      setIsNewPartModalOpen(false);
      reset(); // Limpiar formulario
    } catch (error: any) {
      toast.error("Error al crear producto", { description: error.message });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" /> KARDEX - Inventario
          </h1>
          <p className="text-gray-600 text-lg mt-1">
            {parts.length} repuestos en catálogo
          </p>
        </div>

        <div className="flex gap-3">
          {/* Botón para crear un producto totalmente nuevo en el catálogo */}
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-6 text-lg font-bold border-2"
            onClick={() => setIsNewPartModalOpen(true)}
          >
            <FileEdit className="w-5 h-5 mr-2" />
            Nuevo Producto
          </Button>

          {/* Botón para registrar entradas o salidas */}
          <Link to="/kardex/new-movement">
            <Button
              size="lg"
              className="h-14 px-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              <ArrowRightLeft className="w-5 h-5 mr-2" />
              Movimiento E/S
            </Button>
          </Link>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50/50">
            <CardTitle className="text-sm font-bold text-blue-800 uppercase tracking-wider">
              Total Catálogo
            </CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-gray-800">
              {parts.length}
            </div>
            <p className="text-base font-medium text-blue-600 mt-1">
              Tipos de repuestos
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-orange-50/50">
            <CardTitle className="text-sm font-bold text-orange-800 uppercase tracking-wider">
              Stock Crítico
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-orange-600">
              {criticalStock.length}
            </div>
            <p className="text-base font-medium text-orange-700 mt-1">
              Requieren compra pronto
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-red-50">
            <CardTitle className="text-sm font-bold text-red-800 uppercase tracking-wider">
              Sin Stock
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-red-600">
              {outOfStock.length}
            </div>
            <p className="text-base font-bold text-red-700 mt-1">
              Totalmente agotados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BUSCADOR GIGANTE */}
      <div className="relative shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar repuesto por nombre o código SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-14 h-16 text-xl rounded-xl border-2 border-gray-200 focus-visible:border-blue-500"
        />
      </div>

      {/* LISTADO DE REPUESTOS */}
      {filteredParts.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 text-lg">
            Intenta con otro término de búsqueda.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredParts.map((part) => {
            const stock = getAvailableStock(part.id);
            const isOutOfStock = stock <= 0;
            const isCritical = stock > 0 && stock <= part.minStock;

            return (
              <Card
                key={part.id}
                className={`transition-all hover:shadow-md border-2 ${isOutOfStock ? "border-red-300 bg-red-50/30" : isCritical ? "border-orange-300 bg-orange-50/30" : "border-gray-100"}`}
              >
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-black text-gray-800">
                        {part.name}
                      </h3>
                      {isOutOfStock ? (
                        <Badge
                          variant="destructive"
                          className="text-sm px-3 py-1 font-bold shadow-sm"
                        >
                          AGOTADO
                        </Badge>
                      ) : isCritical ? (
                        <Badge
                          variant="outline"
                          className="text-sm px-3 py-1 font-bold border-orange-400 text-orange-700 bg-orange-100 shadow-sm"
                        >
                          CRÍTICO
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="text-sm px-3 py-1 font-bold bg-green-100 text-green-800 hover:bg-green-200 border-0"
                        >
                          DISPONIBLE
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white p-4 rounded-xl border shadow-sm">
                      <div>
                        <p className="text-gray-500 uppercase font-bold text-[10px] tracking-wider mb-1">
                          Código SKU
                        </p>
                        <p className="font-mono font-bold text-base text-gray-700">
                          {part.sku}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase font-bold text-[10px] tracking-wider mb-1">
                          Precio Unit.
                        </p>
                        <p className="font-bold text-base text-gray-700">
                          S/ {part.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase font-bold text-[10px] tracking-wider mb-1">
                          Stock Mínimo
                        </p>
                        <p className="font-medium text-base text-gray-600">
                          {part.minStock} und.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 -my-2 -mx-2 rounded-lg border flex flex-col justify-center items-center">
                        <p className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                          STOCK ACTUAL
                        </p>
                        <p
                          className={`font-black text-3xl mt-1 ${isOutOfStock ? "text-red-600" : isCritical ? "text-orange-600" : "text-green-600"}`}
                        >
                          {stock}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BOTÓN DE ACCIÓN RÁPIDA PARA ESTE REPUESTO */}
                  <div className="w-full md:w-auto flex-shrink-0">
                    <Button
                      variant={isOutOfStock ? "default" : "outline"}
                      size="lg"
                      className={`w-full md:w-auto h-14 px-6 font-bold rounded-xl transition-all ${isOutOfStock ? "bg-red-600 hover:bg-red-700 text-white shadow-md" : "border-2"}`}
                      onClick={() => {
                        navigate("/kardex/new-movement", {
                          state: { preselectedPartId: part.id },
                        });
                      }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Ajustar Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL DE NUEVO PRODUCTO */}
      <Dialog open={isNewPartModalOpen} onOpenChange={setIsNewPartModalOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-2xl">
          <div className="bg-white px-6 py-5 border-b border-gray-100">
            <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" /> Crear Nuevo Producto
            </DialogTitle>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmitNewPart)}>
              <div className="p-6 bg-gray-50/50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="sku"
                    rules={{ required: "Requerido" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-gray-700">
                          SKU (Código) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="uppercase h-12 border-2 border-gray-300 focus-visible:border-blue-500"
                            placeholder="Ej: FILT-001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="category"
                    rules={{ required: "Requerido" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-gray-700">
                          Categoría *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 border-2 border-gray-300 focus-visible:border-blue-500"
                            placeholder="Ej: Filtros, Llantas..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="name"
                  rules={{ required: "Requerido" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-gray-700">
                        Nombre del Producto *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 border-2 border-gray-300 focus-visible:border-blue-500"
                          placeholder="Ej: Filtro de Aceite Honda"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="unitPrice"
                    rules={{ required: "Requerido", min: 0 }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-gray-700">
                          Precio Unit. (S/) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            className="h-12 text-lg font-bold border-2 border-gray-300 focus-visible:border-blue-500"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="minStock"
                    rules={{ required: "Requerido", min: 1 }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-gray-700">
                          Stock Mínimo *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            className="h-12 text-lg font-bold border-2 border-gray-300 focus-visible:border-blue-500"
                            placeholder="5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-gray-700">
                        Descripción (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none h-20 border-2 border-gray-300 focus-visible:border-blue-500"
                          placeholder="Marca, compatibilidad, detalles..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-white p-6 border-t border-gray-100 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-14 text-base font-bold border-2 border-gray-200 text-gray-600 rounded-xl"
                  onClick={() => {
                    setIsNewPartModalOpen(false);
                    reset();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-14 text-base font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                  disabled={isSubmitting}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Guardando..." : "Guardar Producto"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
