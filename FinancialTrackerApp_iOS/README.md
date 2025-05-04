# Financial Tracker App iOS

Una aplicación iOS nativa para el seguimiento de gastos, administración de cuentas y generación de informes financieros.

## Características

- **Dashboard**: Visualización de balance total, gastos mensuales y cuentas activas.
- **Gestión de Gastos**: Agregar, editar y eliminar gastos con categorías personalizadas.
- **Administración de Cuentas**: Crear y administrar múltiples cuentas con diferentes monedas.
- **Informes**: Visualización de gastos por categoría y día, con opción para generar reportes Excel.
- **Soporte para múltiples monedas**: Manejo de COP (Peso Colombiano) y USD (Dólar Estadounidense).
- **Almacenamiento local**: La app guarda toda la información en el dispositivo.

## Estructura del Proyecto

```
FinancialTrackerApp_iOS/
├── AppDelegate.swift              # Punto de entrada de la aplicación
├── Models/                        # Modelos de datos
│   ├── Account.swift              # Modelo para cuentas
│   ├── Expense.swift              # Modelo para gastos
│   ├── CurrencyManager.swift      # Gestión de monedas y conversión
│   └── DateUtils.swift            # Utilidades para manejo de fechas
├── Views/                         # Vistas y componentes de UI
├── Controllers/                   # Controladores de vista
│   ├── MainTabBarController.swift # Controlador de pestañas principal
│   ├── DashboardViewController.swift
│   ├── ExpensesViewController.swift
│   ├── AccountsViewController.swift
│   └── ReportsViewController.swift
├── Database/                      # Capa de acceso a datos
│   └── DatabaseManager.swift      # Gestión de la base de datos
└── Utils/                         # Utilidades adicionales
    └── ExcelGenerator.swift       # Generación de reportes Excel
```

## Guía de Instalación y Uso

### Instalación en iPhone (requiere Mac con Xcode)

1. Clona el repositorio a tu Mac
2. Abre el proyecto en Xcode
3. Conecta tu iPhone mediante un cable USB
4. Selecciona tu iPhone como dispositivo de ejecución
5. Presiona el botón "Play" para compilar e instalar

### Uso de Funcionalidades Principales

#### Agregar Nuevo Gasto
1. En la pestaña "Gastos", toca el botón flotante (+) en la parte inferior derecha
2. Completa el formulario con:
   - Monto del gasto
   - Moneda (COP o USD)
   - Fecha
   - Categoría (selecciona entre las opciones predefinidas)
   - Descripción (opcional)
   - Cuenta asociada
3. Toca "Guardar Gasto" para registrarlo

#### Crear Nueva Cuenta
1. En la pestaña "Cuentas", toca el botón flotante (+) en la parte inferior derecha
2. Completa el formulario con:
   - Nombre de la cuenta
   - Tipo de cuenta (Corriente, Ahorros, etc.)
   - Saldo inicial
   - Moneda (COP o USD)
   - Descripción (opcional)
3. Toca "Guardar Cuenta" para crearla

#### Descargar Reporte Excel
1. Ve a la pestaña "Informes"
2. Selecciona el mes y año que deseas analizar usando los botones de navegación
3. Toca el botón "Generar Reporte Excel" en la parte inferior
4. El sistema generará un archivo y mostrará opciones para guardarlo o compartirlo

#### Visualizar Gráficos en el Dashboard
1. Ve a la pestaña "Dashboard"
2. Observa el gráfico circular que muestra la distribución de gastos por categoría
3. Puedes cambiar la moneda con el selector en la parte superior para ver los valores convertidos automáticamente
4. El dashboard muestra un resumen actualizado en tiempo real de tus balances y gastos

### Solución de Problemas

Si no tienes acceso a un Mac con Xcode, considera alternativas como:
- Usar servicios de CI/CD como Codemagic o Bitrise para compilar la app
- Explorar TestFlight para la distribución beta (requiere cuenta de desarrollador)
- Solicitar ayuda a un desarrollador iOS para la compilación e instalación

## Información Adicional

La versión actual de la aplicación usa almacenamiento en memoria para demostración, pero en una versión de producción usaría CoreData para persistencia de datos.

## Soporte

Para soporte o sugerencias, contacte al desarrollador o abra un issue en este repositorio.