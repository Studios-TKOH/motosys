import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toggleSound, toggleVibration, setVolume, setFontSize, toggleHighContrast } from '../store/slices/settingsSlice';
import { Volume2, VolumeX, Vibrate, Type, Eye, Download, Upload } from 'lucide-react';

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);

  const handleExport = () => {
    alert('Exportar datos - Funcionalidad en construcción');
  };

  const handleImport = () => {
    alert('Importar datos - Funcionalidad en construcción');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600 mt-1">Ajustes del sistema y accesibilidad</p>
      </div>

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
              <Label htmlFor="sound-enabled" className="text-lg">Habilitar Sonido</Label>
              <p className="text-sm text-gray-500 mt-1">Reproducir sonidos al escanear</p>
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
                <span className="text-lg font-medium">{settings.volume}%</span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={(values) => dispatch(setVolume(values[0]))}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vibrate className="w-5 h-5" />
            Vibración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="vibration-enabled" className="text-lg">Habilitar Vibración</Label>
              <p className="text-sm text-gray-500 mt-1">Vibrar al escanear (solo móvil)</p>
            </div>
            <Switch
              id="vibration-enabled"
              checked={settings.vibrationEnabled}
              onCheckedChange={() => dispatch(toggleVibration())}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Accesibilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-lg">Tamaño de Fuente</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: any) => dispatch(setFontSize(value))}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (16px)</SelectItem>
                <SelectItem value="large">Grande (18px)</SelectItem>
                <SelectItem value="xlarge">Extra Grande (20px)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Recomendado: <strong>Grande</strong> o <strong>Extra Grande</strong> para facilitar la lectura
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast" className="text-lg">Alto Contraste</Label>
              <p className="text-sm text-gray-500 mt-1">Aumentar contraste de colores</p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={() => dispatch(toggleHighContrast())}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Respaldo de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-lg">Exportar Datos</Label>
            <p className="text-sm text-gray-500 mt-1 mb-3">
              Crear copia de seguridad de toda la información
            </p>
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Exportar Base de Datos
            </Button>
          </div>

          <div>
            <Label className="text-lg">Importar Datos</Label>
            <p className="text-sm text-gray-500 mt-1 mb-3">
              Restaurar desde copia de seguridad
            </p>
            <Button onClick={handleImport} variant="outline" className="w-full" size="lg">
              <Upload className="w-4 h-4 mr-2" />
              Importar Base de Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Información del Sistema</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• <strong>Versión:</strong> 1.0.0</p>
            <p>• <strong>Modo:</strong> Offline-First (IndexedDB)</p>
            <p>• <strong>Última actualización:</strong> Marzo 2, 2026</p>
            <p>• <strong>Datos almacenados:</strong> Localmente en este dispositivo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
