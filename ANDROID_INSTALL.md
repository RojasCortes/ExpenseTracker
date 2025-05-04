# Guía de Instalación para Android

Esta guía te ayudará a instalar la aplicación Financial Tracker en tu dispositivo Android.

## Método 1: Instalación como PWA (Aplicación Web Progresiva)

Esta es la forma más sencilla de instalar la aplicación sin necesidad de generar un APK:

1. **Abre Chrome** en tu dispositivo Android
2. Visita la URL: https://[tu-dominio]/
   - Si estás ejecutando la app localmente, visita: http://localhost:5000
   - O usa la versión desplegada en Replit: [URL de tu Replit]
3. Toca el menú (tres puntos) en la esquina superior derecha
4. Selecciona "Añadir a pantalla de inicio" o "Instalar aplicación"
5. Confirma la instalación
6. ¡Listo! Ahora tendrás un ícono de la aplicación en tu pantalla de inicio

## Método 2: Generar APK con Capacitor

Para crear un archivo APK instalable, necesitarás:

1. Instalar Android Studio en tu computadora
2. Seguir estos pasos para generar el APK:

### Preparación

```bash
# Instalar Capacitor y herramientas necesarias
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init FinancialTracker com.financialtracker.app
npx cap add android

# Configurar para producción
npm run build

# Copiar archivos a proyecto Android
npx cap copy android
npx cap open android
```

### En Android Studio

1. Ve a Build > Build Bundle(s) / APK(s) > Build APK(s)
2. Espera a que se complete la compilación
3. Haz clic en la notificación "APK generated" o localiza el archivo APK en:
   `android/app/build/outputs/apk/debug/app-debug.apk`
4. Transfiere este archivo a tu dispositivo Android
5. En tu dispositivo, abre el archivo APK y sigue las instrucciones de instalación

## Funcionalidades Disponibles

Una vez instalada la aplicación, podrás:

### Dashboard
- Visualizar el balance total de todas tus cuentas
- Ver estadísticas rápidas de gastos mensuales
- Cambiar entre monedas (COP y USD)
- Ver un gráfico de distribución de gastos por categoría

### Gestión de Gastos
1. Toca el ícono de "+" cuando estés en la sección de Gastos
2. Completa el formulario:
   - Monto del gasto
   - Moneda (COP o USD)
   - Fecha
   - Categoría
   - Cuenta asociada (opcional)
   - Descripción (opcional)
3. Guarda el gasto

### Administración de Cuentas
1. Toca el ícono de "+" cuando estés en la sección de Cuentas
2. Completa el formulario:
   - Nombre de la cuenta
   - Saldo inicial
   - Moneda
   - Descripción (opcional)
3. Guarda la cuenta

### Generación de Reportes Excel
1. Ve a la sección de Informes
2. Selecciona el mes y año deseado usando los controles de navegación
3. Haz clic en "Generar Reporte Excel"
4. El archivo Excel se descargará automáticamente

## Solución de Problemas

### La aplicación no carga
- Verifica tu conexión a internet
- Intenta despejar la caché del navegador

### No puedo instalar la PWA
- Asegúrate de usar Chrome actualizado
- Verifica que estés accediendo a través de HTTPS (excepto en localhost)

### Problemas con los gráficos
- Asegúrate de tener datos (gastos) registrados para visualizar los gráficos
- Actualiza la aplicación si los gráficos no se muestran correctamente