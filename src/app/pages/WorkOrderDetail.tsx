import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { updateWorkOrderStatus } from "../store/slices/workOrdersSlice";
import { getDB, WorkOrderService, WorkOrderPart } from "../lib/db";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  Play,
  Truck,
  CreditCard,
  AlertCircle,
  Bike,
} from "lucide-react";

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Datos globales
  const workOrder = useSelector((state: RootState) =>
    state.workOrders.workOrders.find((wo) => wo.id === id),
  );
  const motorcycles = useSelector(
    (state: RootState) => state.motorcycles.motorcycles,
  );
  const allParts = useSelector((state: RootState) => state.parts.parts);

  // Estado local para los detalles que viven en IndexedDB
  const [services, setServices] = useState<WorkOrderService[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const db = await getDB();
        const woServices = await db.getAllFromIndex(
          "workOrderServices",
          "by-workOrder",
          id,
        );
        const woParts = await db.getAllFromIndex(
          "workOrderParts",
          "by-workOrder",
          id,
        );

        setServices(woServices);
        setParts(woParts);
      } catch (error) {
        toast.error("Error al cargar detalles de la OT");
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (!workOrder) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-500">
          Orden de trabajo no encontrada
        </h2>
        <Button
          className="mt-4 h-12 text-lg"
          onClick={() => navigate("/work-orders")}
        >
          Volver
        </Button>
      </div>
    );
  }

  const moto = motorcycles.find((m) => m.id === workOrder.motorcycleId);

  // Manejo de Estados
  const advanceStatus = async () => {
    let nextStatus: "IN_PROGRESS" | "COMPLETED" | "DELIVERED" | null = null;
    let actionText = "";

    if (workOrder.status === "PENDING") {
      nextStatus = "IN_PROGRESS";
      actionText = "Trabajo Iniciado";
    } else if (workOrder.status === "IN_PROGRESS") {
      nextStatus = "COMPLETED";
      actionText = "Trabajo Completado";
    } else if (workOrder.status === "COMPLETED") {
      nextStatus = "DELIVERED";
      actionText = "Moto Entregada";
    }

    if (nextStatus) {
      try {
        await dispatch(
          updateWorkOrderStatus({ id: workOrder.id, status: nextStatus }),
        ).unwrap();
        toast.success(`Estado actualizado`, { description: actionText });
      } catch (error: any) {
        toast.error("No se pudo actualizar el estado", {
          description: error.message,
        });
      }
    }
  };

  // UI Helpers para el estado
  const statusConfig = {
    PENDING: {
      label: "PENDIENTE",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock,
    },
    IN_PROGRESS: {
      label: "EN PROCESO",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: Wrench,
    },
    COMPLETED: {
      label: "TERMINADO",
      color: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircle2,
    },
    DELIVERED: {
      label: "ENTREGADO",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: Truck,
    },
  };
  const StatusIcon = statusConfig[workOrder.status].icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* CABECERA */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/work-orders")}
          className="h-14 w-14"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-blue-900">
              {workOrder.number}
            </h1>
            <Badge
              className={`px-4 py-1.5 text-sm font-bold border-2 ${statusConfig[workOrder.status].color}`}
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig[workOrder.status].label}
            </Badge>
          </div>
          <p className="text-gray-500 text-lg mt-1">
            Creada el {new Date(workOrder.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* PANEL DE CONTROL DE ESTADO (BOTÓN AVANZAR GIGANTE) */}
      {workOrder.status !== "DELIVERED" && (
        <Card className="border-2 border-blue-200 bg-blue-50/50 shadow-sm">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-blue-900">
                Actualizar Estado de la Orden
              </h3>
              <p className="text-blue-700">
                Mueve la OT a la siguiente fase del taller.
              </p>
            </div>

            {workOrder.status === "PENDING" && (
              <Button
                onClick={advanceStatus}
                size="lg"
                className="h-16 px-8 text-xl bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                <Play className="mr-2 h-6 w-6" /> Iniciar Trabajo
              </Button>
            )}
            {workOrder.status === "IN_PROGRESS" && (
              <Button
                onClick={advanceStatus}
                size="lg"
                className="h-16 px-8 text-xl bg-green-600 hover:bg-green-700 w-full md:w-auto"
              >
                <CheckCircle2 className="mr-2 h-6 w-6" /> Finalizar Trabajo
              </Button>
            )}
            {workOrder.status === "COMPLETED" && (
              <Button
                onClick={advanceStatus}
                size="lg"
                className="h-16 px-8 text-xl bg-gray-800 hover:bg-gray-900 w-full md:w-auto"
              >
                <Truck className="mr-2 h-6 w-6" /> Entregar Moto
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: MOTO Y DESCRIPCIÓN */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gray-50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5 text-gray-500" /> Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {moto ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                      Código Interno
                    </p>
                    <p className="text-2xl font-black text-blue-600">
                      {moto.shopCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                      Marca y Modelo
                    </p>
                    <p className="text-xl font-bold">
                      {moto.brand} {moto.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                      Color
                    </p>
                    <p className="text-lg">{moto.color || "No registrado"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" /> Moto no encontrada
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gray-50 pb-4">
              <CardTitle>Motivo de Ingreso</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {workOrder.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: SERVICIOS Y REPUESTOS */}
        <div className="md:col-span-2 space-y-6">
          {/* SERVICIOS */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" /> Mano de Obra /
                Servicios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingDetails ? (
                <p className="p-6 text-center text-gray-500">Cargando...</p>
              ) : services.length === 0 ? (
                <p className="p-6 text-center text-gray-500">
                  No se registraron servicios.
                </p>
              ) : (
                <div className="divide-y">
                  {services.map((svc) => (
                    <div
                      key={svc.id}
                      className="p-4 flex justify-between items-center hover:bg-gray-50"
                    >
                      <span className="text-lg font-medium">
                        {svc.description}
                      </span>
                      <span className="text-xl font-bold">
                        S/ {svc.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* REPUESTOS */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-orange-50 border-b border-orange-100">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Package className="h-5 w-5" /> Repuestos Consumidos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingDetails ? (
                <p className="p-6 text-center text-gray-500">Cargando...</p>
              ) : parts.length === 0 ? (
                <p className="p-6 text-center text-gray-500">
                  No se consumieron repuestos.
                </p>
              ) : (
                <div className="divide-y">
                  {parts.map((p) => {
                    const partInfo = allParts.find((ap) => ap.id === p.partId);
                    return (
                      <div
                        key={p.id}
                        className="p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-lg font-bold">
                            {partInfo?.name || "Repuesto Desconocido"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            SKU: {partInfo?.sku} | Cantidad: {p.quantity} x S/{" "}
                            {p.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <span className="text-xl font-bold">
                          S/ {(p.quantity * p.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BARRA INFERIOR DE TOTAL Y COBRO */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 md:pl-64">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-lg font-medium">
              Total de la Orden
            </p>
            <p className="text-4xl font-black text-green-600">
              S/ {workOrder.totalAmount.toFixed(2)}
            </p>
          </div>

          <Button
            size="lg"
            className="h-16 px-10 text-2xl font-bold bg-green-600 hover:bg-green-700 shadow-lg"
            onClick={() => {
              navigate("/payments");
              toast.success("Redirigiendo a caja...", {
                description: `Monto pendiente a cobrar: S/ ${workOrder.totalAmount.toFixed(2)}`,
              });
            }}
          >
            <CreditCard className="mr-3 h-8 w-8" />
            Cobrar Orden
          </Button>
        </div>
      </div>
    </div>
  );
}
