import React from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { RootState, AppDispatch } from "../store/store";
import { createSale } from "../store/slices/salesSlice";
// NUEVO: Importamos la acción para crear la cuenta por cobrar
import { createAccountReceivable } from "../store/slices/paymentsSlice";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  ShoppingCart,
  Package,
  Wrench,
  Save,
  Bike,
} from "lucide-react";

type SaleFormValues = {
  motorcycleId: string | undefined;
  products: {
    partId: string;
    quantity: number | string;
    unitPrice: number | string;
  }[];
  services: { description: string; price: number | string }[];
};

export default function NewSale() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const motorcycles = useSelector(
    (state: RootState) => state.motorcycles.motorcycles,
  );
  const parts = useSelector((state: RootState) => state.parts.parts);
  const stockBalances: any = useSelector(
    (state: RootState) => (state.parts as any).stockBalances,
  );

  const form = useForm<SaleFormValues>({
    defaultValues: {
      motorcycleId: "none",
      products: [],
      services: [],
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "products",
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "services",
  });

  const watchedProducts = watch("products");
  const watchedServices = watch("services");

  const totalAmount =
    watchedProducts.reduce(
      (sum, p) =>
        sum +
        (parseFloat(String(p.quantity)) || 0) *
          (parseFloat(String(p.unitPrice)) || 0),
      0,
    ) +
    watchedServices.reduce(
      (sum, s) => sum + (parseFloat(String(s.price)) || 0),
      0,
    );

  const getAvailableStock = (partId: string) => {
    if (!stockBalances) return 0;

    if (Array.isArray(stockBalances)) {
      const balance = stockBalances.find((sb: any) => sb.partId === partId);
      return balance ? parseFloat(String(balance.quantity)) : 0;
    }

    if (typeof stockBalances === "object") {
      const balance = stockBalances[partId];
      if (balance) {
        return parseFloat(String(balance.quantity ?? balance ?? 0));
      }
    }

    return 0;
  };

  const onSubmit = async (data: SaleFormValues) => {
    try {
      if (data.products.length === 0 && data.services.length === 0) {
        toast.error("Venta vacía", {
          description:
            "Agrega al menos un producto o servicio para realizar la venta.",
        });
        return;
      }

      const invalidProducts = data.products.filter(
        (p) => parseFloat(String(p.quantity)) > getAvailableStock(p.partId),
      );
      if (invalidProducts.length > 0) {
        toast.error("Error de Stock", {
          description:
            "Revisa las cantidades. Algunos productos exceden el stock disponible.",
        });
        return;
      }

      const realMotorcycleId =
        data.motorcycleId === "none" ? undefined : data.motorcycleId;
      const selectedMoto = realMotorcycleId
        ? motorcycles.find((m) => m.id === realMotorcycleId)
        : undefined;
      const customerId = selectedMoto?.customerId;

      const items = [
        ...data.products.map((p) => {
          const partInfo = parts.find((part) => part.id === p.partId);
          return {
            type: "PRODUCT" as const,
            itemId: p.partId,
            description: partInfo?.name || "Producto General",
            quantity: parseFloat(String(p.quantity)),
            unitPrice: parseFloat(String(p.unitPrice)),
            subtotal:
              parseFloat(String(p.quantity)) * parseFloat(String(p.unitPrice)),
          };
        }),
        ...data.services.map((s) => ({
          type: "SERVICE" as const,
          description: s.description,
          quantity: 1,
          unitPrice: parseFloat(String(s.price)),
          subtotal: parseFloat(String(s.price)),
        })),
      ];

      const payload = {
        motorcycleId: realMotorcycleId,
        customerId,
        items,
        paidAmount: 0,
      };

      // 1. Guardamos la Venta
      const createdSale = await dispatch(createSale(payload)).unwrap();

      // 2. EL PUENTE: Creamos la Cuenta por Cobrar
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      await dispatch(
        createAccountReceivable({
          saleId: createdSale.id,
          customerId: customerId || "CLIENTE_MOSTRADOR", // Fallback si es venta anónima
          totalAmount: totalAmount,
          paidAmount: 0,
          dueDate: endOfDay.getTime(),
        }),
      ).unwrap();

      toast.success("Venta Generada Exitosamente", {
        description: "El comprobante y la deuda han sido generados.",
      });

      navigate("/sales");
    } catch (error: any) {
      toast.error("Error al registrar la venta", {
        description:
          error.message || "Ocurrió un problema en la base de datos.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/sales")}
          className="h-14 w-14"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" /> Nueva Venta
          </h1>
          <p className="text-gray-500 text-lg">
            Venta rápida de repuestos y servicios
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-2 border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-700">
                <Bike className="h-6 w-6" /> Asociar a Motocicleta (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FormField
                control={control}
                name="motorcycleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">
                      Selecciona una moto para que el QR aparezca en la Nota de
                      Venta
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue placeholder="Venta anónima (Sin moto)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-lg py-3 italic text-gray-500"
                        >
                          -- Venta al mostrador (Sin vehículo) --
                        </SelectItem>
                        {motorcycles.map((moto) => (
                          <SelectItem
                            key={moto.id}
                            value={moto.id}
                            className="text-lg py-3"
                          >
                            <span className="font-bold text-blue-600">
                              {moto.shopCode}
                            </span>{" "}
                            - {moto.brand} {moto.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between bg-blue-50/30">
              <CardTitle className="text-2xl flex items-center gap-2 text-blue-800">
                <Package className="h-6 w-6" /> Productos / Repuestos
              </CardTitle>
              <Button
                type="button"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 h-12 px-6 text-lg"
                onClick={() =>
                  appendProduct({ partId: "", quantity: 1, unitPrice: "" })
                }
              >
                <Plus className="h-5 w-5 mr-2" /> Agregar Producto
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {productFields.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  No se han agregado productos a la venta.
                </div>
              )}
              {productFields.map((field, index) => {
                const selectedPartId = watchedProducts[index]?.partId;
                const stock = selectedPartId
                  ? getAvailableStock(selectedPartId)
                  : null;
                const isOutOfStock = stock !== null && stock <= 0;
                const qtyRequested = parseFloat(
                  String(watchedProducts[index]?.quantity || 1),
                );
                const isExceedingStock = stock !== null && qtyRequested > stock;

                return (
                  <div
                    key={field.id}
                    className={`flex flex-col gap-4 p-4 rounded-lg border-2 ${isOutOfStock ? "border-red-500 bg-red-50" : "bg-gray-50"}`}
                  >
                    {isOutOfStock && (
                      <div className="bg-red-600 text-white p-4 rounded-md flex items-center gap-3">
                        <AlertTriangle className="h-10 w-10 flex-shrink-0" />
                        <div>
                          <h3 className="text-2xl font-black tracking-wider">
                            NO HAY STOCK
                          </h3>
                          <p className="text-lg">
                            No puedes vender este producto hasta realizar un
                            ajuste en KARDEX.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 items-start w-full flex-wrap md:flex-nowrap">
                      <FormField
                        control={control}
                        name={`products.${index}.partId`}
                        rules={{ required: true }}
                        render={({ field: selectField }) => (
                          <FormItem className="flex-1 min-w-[200px]">
                            <FormLabel>Buscar Producto</FormLabel>
                            <Select
                              onValueChange={(val) => {
                                selectField.onChange(val);
                                const selected = parts.find(
                                  (p) => p.id === val,
                                );
                                if (selected)
                                  setValue(
                                    `products.${index}.unitPrice`,
                                    selected.unitPrice,
                                  );
                              }}
                              defaultValue={selectField.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-14 text-lg bg-white">
                                  <SelectValue placeholder="Busca por SKU o Nombre..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {parts.map((part) => {
                                  const currentStock = getAvailableStock(
                                    part.id,
                                  );
                                  return (
                                    <SelectItem
                                      key={part.id}
                                      value={part.id}
                                      disabled={currentStock <= 0}
                                      className="py-3"
                                    >
                                      <div className="flex items-center justify-between w-full gap-4">
                                        <span className="text-lg font-medium">
                                          {part.name} ({part.sku})
                                        </span>
                                        <Badge
                                          variant={
                                            currentStock > 0
                                              ? "default"
                                              : "destructive"
                                          }
                                        >
                                          Stock: {currentStock}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`products.${index}.quantity`}
                        rules={{
                          required: true,
                          min: 1,
                          validate: (val) =>
                            !stock ||
                            parseFloat(String(val)) <= stock ||
                            "Excede stock",
                        }}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className={`h-14 text-xl font-bold text-center bg-white ${isExceedingStock ? "border-red-500 text-red-600 focus-visible:ring-red-500" : ""}`}
                                {...field}
                              />
                            </FormControl>
                            {isExceedingStock && (
                              <span className="text-red-600 font-bold text-sm block -mt-1">
                                Máx: {stock}
                              </span>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`products.${index}.unitPrice`}
                        rules={{ required: true, min: 0 }}
                        render={({ field }) => (
                          <FormItem className="w-36">
                            <FormLabel>P. Unit (S/)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                className="h-14 text-xl font-bold bg-white"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-14 w-14 mt-8 flex-shrink-0 shadow-sm"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-700">
                <Wrench className="h-5 w-5" /> Servicios y Mano de Obra
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => appendService({ description: "", price: "" })}
                className="h-12 px-6"
              >
                <Plus className="h-5 w-5 mr-2" /> Agregar Servicio
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {serviceFields.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  Sin servicios adicionales.
                </div>
              )}
              {serviceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-start p-4 rounded-lg border bg-white"
                >
                  <FormField
                    control={control}
                    name={`services.${index}.description`}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Descripción del servicio</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 text-lg"
                            placeholder="Ej: Instalación de accesorio"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`services.${index}.price`}
                    rules={{ required: true, min: 0 }}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormLabel>Precio (S/)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            className="h-12 text-lg font-bold"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 mt-8 text-red-500 hover:bg-red-50 hover:text-red-700 flex-shrink-0"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 md:pl-64">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-lg font-medium">
                  Total a Cobrar
                </p>
                <p className="text-4xl font-black text-green-600">
                  S/ {totalAmount.toFixed(2)}
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || totalAmount <= 0}
                className="h-16 px-10 text-2xl font-bold bg-green-600 hover:bg-green-700 disabled:opacity-50 shadow-lg"
              >
                <Save className="mr-3 h-8 w-8" />
                {isSubmitting ? "Procesando..." : "Generar Nota de Venta"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
