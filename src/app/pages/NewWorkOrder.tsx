import React from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { RootState, AppDispatch } from "../store/store";
import { createWorkOrder } from "../store/slices/workOrdersSlice";
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
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Save,
  Wrench,
  Package,
} from "lucide-react";

type WorkOrderFormValues = {
  motorcycleId: string;
  description: string;
  services: { description: string; price: number | string }[];
  parts: {
    partId: string;
    quantity: number | string;
    unitPrice: number | string;
  }[];
};

export default function NewWorkOrder() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const motorcycles = useSelector(
    (state: RootState) => state.motorcycles.motorcycles,
  );
  const parts = useSelector((state: RootState) => state.parts.parts);
  // SOLUCIÓN AL CRASH: Lo traemos como any para manejarlo dinámicamente si no es array
  const stockBalances: any = useSelector(
    (state: RootState) => (state.parts as any).stockBalances,
  );

  const form = useForm<WorkOrderFormValues>({
    defaultValues: {
      motorcycleId: "",
      description: "",
      services: [],
      parts: [],
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
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "services",
  });

  const {
    fields: partFields,
    append: appendPart,
    remove: removePart,
  } = useFieldArray({
    control,
    name: "parts",
  });

  const watchedServices = watch("services");
  const watchedParts = watch("parts");

  const totalAmount =
    watchedServices.reduce(
      (sum, s) => sum + (parseFloat(String(s.price)) || 0),
      0,
    ) +
    watchedParts.reduce(
      (sum, p) =>
        sum +
        (parseFloat(String(p.quantity)) || 0) *
          (parseFloat(String(p.unitPrice)) || 0),
      0,
    );

  // SOLUCIÓN AL CRASH: Función segura que no explota si stockBalances no es un Array
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

  const onSubmit = async (data: WorkOrderFormValues) => {
    try {
      const invalidParts = data.parts.filter(
        (p) => parseFloat(String(p.quantity)) > getAvailableStock(p.partId),
      );
      if (invalidParts.length > 0) {
        toast.error("Error de Stock", {
          description:
            "Revisa las cantidades de los repuestos. Exceden el stock disponible.",
        });
        return;
      }

      const selectedMoto = motorcycles.find((m) => m.id === data.motorcycleId);
      if (!selectedMoto) {
        toast.error("Error", {
          description: "La moto seleccionada no es válida.",
        });
        return;
      }

      const payload = {
        motorcycleId: data.motorcycleId,
        customerId: selectedMoto.customerId,
        description: data.description,
        services: data.services.map((s) => ({
          description: s.description,
          price: parseFloat(String(s.price)),
        })),
        parts: data.parts.map((p) => ({
          partId: p.partId,
          quantity: parseFloat(String(p.quantity)),
          unitPrice: parseFloat(String(p.unitPrice)),
        })),
      };

      // 1. Guardamos la Orden de Trabajo
      const createdWO = await dispatch(createWorkOrder(payload)).unwrap();

      // 2. EL PUENTE: Creamos la Cuenta por Cobrar automáticamente
      // Configuramos el vencimiento para el final del día de hoy (23:59:59)
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      await dispatch(
        createAccountReceivable({
          workOrderId: createdWO.id,
          customerId: selectedMoto.customerId,
          totalAmount: totalAmount,
          paidAmount: 0,
          dueDate: endOfDay.getTime(),
        }),
      ).unwrap();

      toast.success("Orden de Trabajo guardada", {
        description: "La OT ha sido creada y enviada a Cuentas por Cobrar.",
      });

      navigate("/work-orders");
    } catch (error: any) {
      toast.error("Error al guardar la orden", {
        description:
          error.message ||
          "Ocurrió un error inesperado al acceder a la base de datos.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/work-orders")}
          className="h-12 w-12"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Orden de Trabajo</h1>
          <p className="text-gray-500 text-lg">
            Registrar mantenimiento o reparación
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-2 border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="text-2xl flex items-center gap-2 text-blue-800">
                <Wrench className="h-6 w-6" /> Datos Principales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={control}
                name="motorcycleId"
                rules={{ required: "Debes seleccionar una moto" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">
                      Motocicleta a reparar *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue placeholder="Selecciona o escanea una moto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {motorcycles.map((moto) => (
                          <SelectItem
                            key={moto.id}
                            value={moto.id}
                            className="text-lg py-3"
                          >
                            <span className="font-bold text-blue-600">
                              {moto.shopCode}
                            </span>{" "}
                            - {moto.brand} {moto.model} ({moto.color})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-lg" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                rules={{ required: "Ingresa el motivo del ingreso" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">
                      Descripción del Problema *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Mantenimiento preventivo, cambio de aceite y revisión de frenos..."
                        className="min-h-[120px] text-lg resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                Servicios (Mano de Obra)
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
            <CardContent className="space-y-4">
              {serviceFields.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  No hay servicios agregados. Presiona "Agregar Servicio".
                </div>
              )}
              {serviceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border"
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
                            placeholder="Ej: Afinamiento completo"
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
                    variant="destructive"
                    size="icon"
                    className="h-12 w-12 mt-8 flex-shrink-0"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-orange-50/30">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="h-6 w-6 text-orange-600" /> Repuestos y
                Materiales
              </CardTitle>
              <Button
                type="button"
                variant="default"
                className="bg-orange-600 hover:bg-orange-700 h-12 px-6 text-lg"
                onClick={() =>
                  appendPart({ partId: "", quantity: 1, unitPrice: "" })
                }
              >
                <Plus className="h-5 w-5 mr-2" /> Agregar Repuesto
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {partFields.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  No se han agregado repuestos.
                </div>
              )}
              {partFields.map((field, index) => {
                const selectedPartId = watchedParts[index]?.partId;
                const stock = selectedPartId
                  ? getAvailableStock(selectedPartId)
                  : null;
                const isOutOfStock = stock !== null && stock <= 0;
                const qtyRequested = parseFloat(
                  String(watchedParts[index]?.quantity || 1),
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
                            Este repuesto no puede ser utilizado hasta ingresar
                            inventario.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 items-start w-full flex-wrap md:flex-nowrap">
                      <FormField
                        control={control}
                        name={`parts.${index}.partId`}
                        rules={{ required: true }}
                        render={({ field: selectField }) => (
                          <FormItem className="flex-1 min-w-[200px]">
                            <FormLabel>Repuesto del Inventario</FormLabel>
                            <Select
                              onValueChange={(val) => {
                                selectField.onChange(val);
                                const selected = parts.find(
                                  (p) => p.id === val,
                                );
                                if (selected) {
                                  setValue(
                                    `parts.${index}.unitPrice`,
                                    selected.unitPrice,
                                  );
                                }
                              }}
                              defaultValue={selectField.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-14 text-lg">
                                  <SelectValue placeholder="Busca un producto..." />
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
                        name={`parts.${index}.quantity`}
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
                                className={`h-14 text-xl font-bold text-center ${isExceedingStock ? "border-red-500 text-red-600 focus-visible:ring-red-500" : ""}`}
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
                        name={`parts.${index}.unitPrice`}
                        rules={{ required: true, min: 0 }}
                        render={({ field }) => (
                          <FormItem className="w-36">
                            <FormLabel>P. Unit (S/)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                className="h-14 text-xl font-bold"
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
                        className="h-14 w-14 mt-8 flex-shrink-0"
                        onClick={() => removePart(index)}
                      >
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 md:pl-64">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-lg font-medium">
                  Total Estimado
                </p>
                <p className="text-4xl font-black text-green-600">
                  S/ {totalAmount.toFixed(2)}
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-16 px-12 text-2xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="mr-3 h-8 w-8" />
                {isSubmitting ? "Guardando..." : "Guardar Orden"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
