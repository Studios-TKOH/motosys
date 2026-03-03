import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { getDB } from "../lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";
import {
  toggleSound,
  toggleVibration,
  setVolume,
  setFontSize,
  toggleHighContrast,
} from "../store/slices/settingsSlice";
import {
  Volume2,
  Vibrate,
  Type,
  Eye,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);

  // Estado local SOLO para mostrar el numerito en pantalla fluidamente
  const [displayVolume, setDisplayVolume] = useState(settings.volume);

  // --- EFECTOS VISUALES REALES (ACCESIBILIDAD) ---
  useEffect(() => {
    const root = document.documentElement;

    if (settings.highContrast) {
      root.style.setProperty("filter", "contrast(125%) saturate(120%)");
    } else {
      root.style.removeProperty("filter");
    }

    if (settings.fontSize === "large") {
      // @ts-ignore
      root.style.zoom = "1.05";
    } else if (settings.fontSize === "xlarge") {
      // @ts-ignore
      root.style.zoom = "1.10";
    } else {
      // @ts-ignore
      root.style.zoom = "1";
    }
  }, [settings.highContrast, settings.fontSize]);

  // --- LÓGICA DE EXPORTACIÓN (BACKUP) ---
  const handleExport = async () => {
    try {
      const db = await getDB();
      const backupData: Record<string, any> = {};

      const stores = [
        "motorcycles",
        "customers",
        "workOrders",
        "workOrderServices",
        "workOrderParts",
        "parts",
        "stockBalances",
        "inventoryMovements",
        "inventoryMovementLines",
        "sales",
        "saleItems",
        "accountsReceivable",
        "payments",
        "sequences",
      ];

      for (const storeName of stores) {
        backupData[storeName] = await db.getAll(storeName as any);
      }

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `MotoSys_Backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Respaldo Creado", {
        description: "Archivo descargado exitosamente.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Error", { description: "No se pudo crear el respaldo." });
    }
  };

  // --- LÓGICA DE IMPORTACIÓN (RESTAURAR) ---
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const dataToRestore = JSON.parse(content);
          const db = await getDB();

          const storeNames = Object.keys(dataToRestore).filter((name) =>
            db.objectStoreNames.contains(name as any),
          );

          if (storeNames.length === 0) {
            toast.error("Archivo inválido", {
              description: "El archivo no contiene datos compatibles.",
            });
            return;
          }

          const tx = db.transaction(storeNames as any, "readwrite");

          for (const storeName of storeNames) {
            const store = tx.objectStore(storeName as any);
            await store.clear();
            const items = dataToRestore[storeName];
            for (const item of items) {
              await store.add(item);
            }
          }

          await tx.done;
          toast.success("Datos Restaurados", {
            description: "El sistema se recargará para aplicar los cambios.",
          });

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error("Error importing data:", error);
          toast.error("Error de Restauración", {
            description: "El archivo está corrupto o es incompatible.",
          });
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Configuración</h1>
        <p className="text-gray-600 text-lg mt-1">
          Ajustes del sistema y accesibilidad
        </p>
      </div>

      {/* --- TARJETA SONIDO --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Sonido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-enabled" className="text-lg">
                Habilitar Sonido
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Reproducir sonidos al escanear
              </p>
            </div>
            <Switch
              id="sound-enabled"
              checked={settings.soundEnabled}
              onCheckedChange={() => dispatch(toggleSound())}
            />
          </div>

          {settings.soundEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Volumen</Label>
                {/* Mostramos el estado local visual */}
                <span className="text-lg font-medium">{displayVolume}%</span>
              </div>

              {/* FIX DEFINITIVO: Componente "No Controlado" para fluidez 100% */}
              <Slider
                defaultValue={[settings.volume]} // Radix se encarga del control de la bolita nativamente
                onValueChange={(values) => setDisplayVolume(values[0])} // Actualiza el número de arriba instantáneamente
                onValueCommit={(values) => dispatch(setVolume(values[0]))} // Guarda en Redux solo cuando sueltas
                min={10}
                max={100}
                step={10}
                className="w-full"
              />

              <p className="text-sm text-gray-500">Rango: 10% - 100%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- TARJETA VIBRACIÓN --- */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Vibrate className="w-6 h-6 text-orange-500" />
            Vibración
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="vibration-enabled" className="text-xl font-bold">
                Habilitar Vibración
              </Label>
              <p className="text-base text-gray-500 mt-1">
                Vibrar al realizar acciones (solo tablets/móviles)
              </p>
            </div>
            <Switch
              id="vibration-enabled"
              className="scale-125 mr-2"
              checked={settings.vibrationEnabled}
              onCheckedChange={() => dispatch(toggleVibration())}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- TARJETA ACCESIBILIDAD --- */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Type className="w-6 h-6 text-green-600" />
            Accesibilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label className="text-xl font-bold">Tamaño de Fuente (Zoom)</Label>

            <Select
              value={settings.fontSize}
              onValueChange={(value: any) => dispatch(setFontSize(value))}
            >
              <SelectTrigger className="h-14 text-lg border-2">
                <div className="flex-1 text-left font-bold text-gray-700">
                  {settings.fontSize === "normal"
                    ? "Normal (16px)"
                    : settings.fontSize === "large"
                      ? "Grande (105%)"
                      : "Extra Grande (110%)"}
                </div>
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="normal" className="text-base py-3">
                  Normal (16px)
                </SelectItem>
                <SelectItem value="large" className="text-lg py-3 font-medium">
                  Grande (105%)
                </SelectItem>
                <SelectItem value="xlarge" className="text-xl py-3 font-bold">
                  Extra Grande (110%)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-base text-gray-500">
              Al cambiar esta opción,{" "}
              <strong>toda la aplicación hará zoom inmediatamente</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <Label
                htmlFor="high-contrast"
                className="text-xl font-bold flex items-center gap-2"
              >
                <Eye className="w-5 h-5 text-purple-600" /> Alto Contraste
              </Label>
              <p className="text-base text-gray-500 mt-1">
                Oscurecer textos y hacer los colores más vibrantes
              </p>
            </div>
            <Switch
              id="high-contrast"
              className="scale-125 mr-2"
              checked={settings.highContrast}
              onCheckedChange={() => dispatch(toggleHighContrast())}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- TARJETA RESPALDO DATOS --- */}
      <Card className="border-2 shadow-sm border-red-100">
        <CardHeader className="bg-red-50/30 border-b border-red-100">
          <CardTitle className="flex items-center gap-2 text-xl text-red-800">
            <Download className="w-6 h-6" />
            Respaldo de Datos (Offline)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4">
            <p className="text-sm font-bold text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Importante
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Toda la información se guarda localmente en este navegador. Crea
              respaldos periódicos (Exportar) y guárdalos en un USB o en la nube
              para evitar pérdida de datos si la computadora se formatea.
            </p>
          </div>

          <div>
            <Label className="text-lg font-bold">Exportar Datos</Label>
            <p className="text-base text-gray-500 mt-1 mb-3">
              Descarga un archivo JSON con toda la información de clientes,
              motos, ventas y configuración.
            </p>
            <Button
              onClick={handleExport}
              className="w-full h-14 text-lg font-bold"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar Copia de Seguridad
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Label className="text-lg font-bold text-red-700">
              Restaurar Datos
            </Label>
            <p className="text-base text-gray-500 mt-1 mb-3">
              Cargar un archivo de respaldo previo.{" "}
              <strong className="text-red-600">
                Advertencia: Esto borrará los datos actuales y los reemplazará
                por los del archivo.
              </strong>
            </p>
            <Button
              onClick={handleImport}
              variant="outline"
              className="w-full h-14 text-lg font-bold border-2 border-red-200 text-red-700 hover:bg-red-50"
              size="lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Restaurar desde archivo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-1 text-sm text-gray-400 font-medium">
        <p>MotoSys Taller V1.0.0</p>
        <p>Modo Operativo: Offline-First (IndexedDB)</p>
      </div>
    </div>
  );
}
