# Financial Tracker App iOS

Una aplicación iOS nativa para el seguimiento de gastos, administración de cuentas y generación de informes financieros.

## Características

- **Dashboard**: Visualización de balance total, gastos mensuales y cuentas activas.
- **Gestión de Gastos**: Agregar, editar y eliminar gastos con categorías personalizadas.
- **Administración de Cuentas**: Crear y administrar múltiples cuentas con diferentes monedas.
- **Informes**: Visualización de gastos por categoría y día, con opción para generar reportes Excel.
- **Soporte para múltiples monedas**: Manejo de COP (Peso Colombiano) y USD (Dólar Estadounidense).
- **Almacenamiento local**: Utiliza CoreData para almacenar toda la información en el dispositivo.

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
│   └── DatabaseManager.swift      # Gestión de CoreData
└── Resources/                     # Recursos adicionales
```

## Guía de Implementación

### Requisitos

- Xcode 13.0+
- iOS 15.0+
- Swift 5.5+

### Instalación

1. Clona el repositorio
2. Abre el proyecto en Xcode
3. Compila y ejecuta en un simulador o dispositivo iOS

### Modelo de Datos

La aplicación utiliza CoreData para la persistencia de datos con dos entidades principales:

- **Account**: Representa una cuenta financiera con saldo y moneda.
- **Expense**: Representa un gasto asociado a una cuenta específica.

### Flujo de Navegación

1. **Dashboard**: Pantalla principal con resumen de finanzas
2. **Gastos**: Lista de gastos con filtros y opciones para agregar/editar
3. **Cuentas**: Administración de cuentas financieras
4. **Informes**: Visualización de informes y análisis financieros

### Conversión de Monedas

La aplicación soporta COP (Peso Colombiano) y USD (Dólar Estadounidense) con conversión automática entre ambas monedas utilizando una tasa de cambio fija (1 USD = 4000 COP).

## Desarrollo Futuro

Características planeadas para futuras versiones:

- Sincronización con la nube
- Categorías de gastos personalizables
- Presupuestos y metas financieras
- Notificaciones y recordatorios
- Importación de transacciones desde bancos
- Soporte para más monedas
- Gráficos y análisis avanzados

## Soporte

Para soporte o sugerencias, contacte al desarrollador o abra un issue en este repositorio.