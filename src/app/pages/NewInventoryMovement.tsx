import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState, AppDispatch } from "../store/store";
// FIX: Importamos también fetchParts para recargar el stock global tras guardar
import {
  createInventoryMovement,
  fetchParts,
} from "../store/slices/partsSlice";

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
  ArrowLeft,
  Save,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";

type MovementFormValues = {
  partId: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number | string;
  reference: string;
  notes: string;
};

export default function NewInventoryMovement() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const parts = useSelector((state: RootState) => state.parts.parts);
  const stockBalances: any = useSelector(
    (state: RootState) => (state.parts as any).stockBalances,
  );

  const form = useForm<MovementFormValues>({
    defaultValues: {
      partId: "",
      type: "IN",
      quantity: "",
      reference: "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;
  const selectedPartId = watch("partId");
  const movementType = watch("type");

  // Si venimos del botón "Ajustar Stock" en el KARDEX, preseleccionamos el repuesto
  useEffect(() => {
    if (location.state && location.state.preselectedPartId) {
      setValue("partId", location.state.preselectedPartId);
    }
  }, [location, setValue]);

  // Helper seguro para obtener stock
  const getAvailableStock = (partId: string) => {
    if (!stockBalances || !partId) return 0;
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

  const currentStock = getAvailableStock(selectedPartId);
  const selectedPartInfo = parts.find((p) => p.id === selectedPartId);

  const onSubmit = async (data: MovementFormValues) => {
    try {
      const qty = parseFloat(String(data.quantity));

      if (qty <= 0) {
        toast.error("Cantidad inválida", {
          description: "La cantidad debe ser mayor a 0.",
        });
        return;
      }

      // Validación extra para salidas
      if (data.type === "OUT" && qty > currentStock) {
        toast.error("Stock insuficiente", {
          description: `Estás intentando retirar ${qty}, pero solo hay ${currentStock} en stock.`,
        });
        return;
      }

      const payload = {
        type: data.type,
        reference: data.reference,
        notes: data.notes,
        lines: [
          {
            partId: data.partId,
            quantity: qty,
            unitPrice: selectedPartInfo?.unitPrice,
          },
        ],
      };

      // 1. Guardamos el movimiento en la DB
      await dispatch(createInventoryMovement(payload)).unwrap();

      // 2. RECARGAMOS LOS INVENTARIOS: Obligamos a Redux a ir por los datos frescos a la DB
      await dispatch(fetchParts()).unwrap();

      toast.success("Movimiento Registrado", {
        description: `El inventario de ${selectedPartInfo?.name} ha sido actualizado al instante.`,
      });

      navigate("/kardex");
    } catch (error: any) {
      toast.error("Error al registrar el movimiento", {
        description: error.message || "Error de base de datos.",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/kardex")}
          className="h-14 w-14"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            Registrar Movimiento
          </h1>
          <p className="text-gray-600 text-lg mt-1">
            Añade stock o registra salidas manuales.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                <PackageSearch className="h-5 w-5 text-blue-600" /> Producto a
                afectar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={control}
                name="partId"
                rules={{ required: "Debes seleccionar un producto" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold text-gray-700">
                      Seleccionar Repuesto *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg border-2 focus-visible:ring-blue-500">
                          <div className="flex-1 text-left truncate">
                            {selectedPartInfo ? (
                              <span className="font-bold">
                                {selectedPartInfo.name}{" "}
                                <span className="text-gray-500 font-normal">
                                  ({selectedPartInfo.sku})
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Busca el producto en el catálogo...
                              </span>
                            )}
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="max-h-[300px] overflow-y-auto"
                      >
                        {parts.map((part) => {
                          const stock = getAvailableStock(part.id);
                          return (
                            <SelectItem
                              key={part.id}
                              value={part.id}
                              className="py-3"
                            >
                              <div className="flex items-center justify-between w-full gap-8">
                                <span className="text-base font-bold">
                                  {part.name}{" "}
                                  <span className="text-sm font-normal text-gray-500">
                                    ({part.sku})
                                  </span>
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs font-bold rounded-md ${stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  Stock: {stock}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Panel de información rápida del producto seleccionado */}
              {selectedPartInfo && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800 font-semibold uppercase tracking-wider mb-1">
                      Stock Actual en Sistema
                    </p>
                    <p className="text-3xl font-black text-blue-900">
                      {currentStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Precio Referencial
                    </p>
                    <p className="text-lg font-bold text-gray-700">
                      S/ {selectedPartInfo.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                <SlidersHorizontal className="h-5 w-5 text-gray-600" /> Detalles
                de la Operación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="type"
                  rules={{ required: "Selecciona el tipo de movimiento" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-gray-700">
                        Tipo de Movimiento *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`h-16 text-lg border-2 font-bold ${
                              field.value === "IN"
                                ? "border-green-400 bg-green-50 text-green-800"
                                : field.value === "OUT"
                                  ? "border-red-400 bg-red-50 text-red-800"
                                  : "border-orange-400 bg-orange-50 text-orange-800"
                            }`}
                          >
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value="IN"
                            className="py-3 text-base font-bold text-green-700 focus:bg-green-50"
                          >
                            <div className="flex items-center">
                              <ArrowDownToLine className="w-5 h-5 mr-2" />{" "}
                              ENTRADA (Añadir Stock)
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="OUT"
                            className="py-3 text-base font-bold text-red-700 focus:bg-red-50"
                          >
                            <div className="flex items-center">
                              <ArrowUpFromLine className="w-5 h-5 mr-2" />{" "}
                              SALIDA (Restar Stock)
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="ADJUST"
                            className="py-3 text-base font-bold text-orange-700 focus:bg-orange-50"
                          >
                            <div className="flex items-center">
                              <SlidersHorizontal className="w-5 h-5 mr-2" />{" "}
                              AJUSTE (Corrección)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="quantity"
                  rules={{
                    required: "Ingresa la cantidad",
                    min: { value: 0.01, message: "Debe ser mayor a 0" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-gray-700">
                        Cantidad *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-16 text-2xl font-black text-center border-2 focus-visible:ring-blue-500"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Previsualización del impacto del movimiento */}
              {selectedPartId &&
                form.watch("quantity") &&
                !isNaN(parseFloat(String(form.watch("quantity")))) && (
                  <div className="flex items-center justify-center gap-4 py-4 px-6 bg-gray-100 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Stock Actual
                      </p>
                      <p className="text-xl font-bold text-gray-400">
                        {currentStock}
                      </p>
                    </div>
                    <div className="text-gray-400 font-black text-2xl">
                      {movementType === "IN" ? "+" : "-"}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Movimiento
                      </p>
                      <p
                        className={`text-xl font-bold ${movementType === "IN" ? "text-green-600" : "text-red-600"}`}
                      >
                        {parseFloat(String(form.watch("quantity")))}
                      </p>
                    </div>
                    <div className="text-gray-400 font-black text-2xl">=</div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-blue-600 uppercase">
                        Nuevo Stock
                      </p>
                      <p className="text-3xl font-black text-blue-700">
                        {movementType === "IN"
                          ? currentStock +
                            parseFloat(String(form.watch("quantity")))
                          : currentStock -
                            parseFloat(String(form.watch("quantity")))}
                      </p>
                    </div>
                  </div>
                )}

              <FormField
                control={control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-700">
                      Documento de Referencia (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 text-base border-gray-300"
                        placeholder="Ej: Factura F001-4502, Guía de Remisión..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-700">
                      Observaciones (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] text-base resize-none border-gray-300"
                        placeholder="Motivo del ajuste, proveedor, detalles de la merma..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 md:pl-64">
            <div className="max-w-3xl mx-auto flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-bold border-2"
                onClick={() => navigate("/kardex")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !selectedPartId}
                className="h-14 px-10 text-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-md"
              >
                <Save className="mr-3 h-6 w-6" />
                {isSubmitting ? "Guardando..." : "Registrar Movimiento"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
