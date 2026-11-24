# Pitch Simulador: Simulador Modelo Financiero Plan de Negocio (SENA)

> **Presentación Ejecutiva del Prototipo Funcional**  
> Herramienta interactiva web para la formulación, simulación financiera, evaluación crítica con Inteligencia Artificial y generación de evidencias de aprendizaje en planes de negocio tecnológicos del **Servicio Nacional de Aprendizaje (SENA)**.

---

## Diapositiva 1 · Resumen Ejecutivo

### ¿En qué consiste el aplicativo?
El **Simulador Modelo Financiero Plan de Negocio** es una aplicación web full-stack diseñada específicamente para que aprendices e instructores del SENA estructuren, validen y sustenten la viabilidad económica de sus proyectos productivos y tecnológicos sin depender de hojas de cálculo complejas o propensas a errores.

A través de un **asistente guiado de 6 pasos**, el aplicativo transforma los datos del proyecto (equipo de aprendices, costos fijos, presupuesto de ventas, inversión inicial, fuentes de financiación y parámetros macroeconómicos) en un **modelo financiero profesional proyectado a 5 años** en tiempo real, acompañado de:
- **Indicadores clave de decisión:** VAN (Valor Actual Neto), TIR (Tasa Interna de Retorno), Punto de Equilibrio mensual y Periodo de Recuperación (*Payback*).
- **Estados Financieros completos:** Estado de Resultados (P&L), Flujo de Caja Libre y Análisis de Sensibilidad en 3 escenarios.
- **Evaluador y Mentor con Inteligencia Artificial:** Dictamen técnico de viabilidad (0 a 100), análisis DOFA financiero, preparación para convocatorias como **Fondo Emprender** y chat interactivo de mentoría.
- **Persistencia en la nube (Firebase) y Evidencia Formal PDF:** Guardado seguro multi-sesión y multi-dispositivo, más generación inmediata de un informe institucional SENA listo para imprimir o entregar como evidencia de aprendizaje.

---

## Diapositiva 2 · El Problema que Resuelve

En los procesos de formación técnica, tecnológica y de emprendimiento del SENA, los aprendices enfrentan barreras recurrentes al construir el componente financiero de sus planes de negocio:

1. **Complejidad técnica de Excel:** Errores frecuentes en fórmulas de depreciación, amortización francesa de créditos, flujo de caja libre, VAN y TIR que invalidan las proyecciones.
2. **Desconexión pedagógica:** Muchos aprendices llenan cifras sin comprender cómo un cambio en el precio, costo variable o gasto fijo afecta su punto de equilibrio y rentabilidad.
3. **Baja retroalimentación oportuna:** Los instructores deben revisar decenas de hojas de cálculo distintas por ficha, dificultando la retroalimentación ágil e individualizada.
4. **Falta de estandarización y trazabilidad:** Pérdida de versiones de archivos y ausencia de un formato unificado de evidencia académica alineado con criterios de convocatorias como Fondo Emprender.

---

## Diapositiva 3 · ¿Cómo Ayuda este Aplicativo al SENA?

### 1. Para los Aprendices (Formación por Proyectos)
- **Aprendizaje práctico sin fricción:** Interfaz paso a paso con *tooltips* pedagógicos en cada variable financiera y formato numérico colombiano con separadores de miles (`$ COP`).
- **Comprensión financiera real:** Visualización inmediata de cómo sus decisiones de precio, volumen de ventas y costos impactan la viabilidad del negocio.
- **Trabajo colaborativo por proyecto:** Registro estructurado de todos los aprendices integrantes (nombre completo y documento) junto con su **Número de Ficha**, centro de formación e instructor tutor.

### 2. Para los Instructores y Centros de Formación
- **Estandarización de evidencias de aprendizaje:** Todos los proyectos generan un **Informe Formal SENA en PDF / Impresión** con encabezado institucional, tabla de proyecciones a 5 años, dictamen de IA y espacio de firmas para aprendiz e instructor.
- **Ejemplos precargados por sector productivo:** Incluye modelos base reales de Software/SaaS, Agroindustria, Servicios de Consultoría y Comercio/Gastronomía para demostraciones en clase.
- **Inicio limpio para evaluación real:** Al abrir el simulador o presionar **Limpiar Campos**, los formularios quedan en blanco para que cada equipo formule su proyecto desde cero.

### 3. Para el Ecosistema de Emprendimiento y Fondo Emprender
- **Pre-evaluación con rigor de jurado:** El Evaluador IA califica el modelo financiero (0–100), detecta costos omitidos o márgenes débiles y evalúa la aptitud frente a **Fondo Emprender**, crédito bancario e inversión privada.
- **Continuidad multi-dispositivo:** Con **Firebase (Auth + Firestore)**, aprendices e instructores pueden guardar múltiples simulaciones o escenarios y retomarlos desde cualquier computador del centro de formación o desde casa.

---

## Diapositiva 4 · Recorrido del Prototipo: Asistente en 6 Pasos

El flujo del usuario separa claramente la captura ordenada de información de la etapa de análisis, evitando saturación visual:

| Paso | Módulo | Información Diligenciada |
| :---: | :--- | :--- |
| **1** | **Perfil del Proyecto** | Nombre del plan de negocio, integrantes del equipo (nombre y documento), número de ficha, ciudad, programa, centro SENA, instructor y sector económico. |
| **2** | **Estructura de Costos y Gastos** | Costos fijos operacionales mensuales (OPEX): nómina, arriendo, servicios públicos, marketing, software/cloud, mantenimiento e imprevistos. |
| **3** | **Presupuesto de Ventas** | Catálogo de productos/servicios con precio de venta, costo variable unitario, unidades del Mes 1, crecimiento mensual (Año 1) y margen bruto automático. |
| **4** | **Inversión Inicial (CAPEX)** | Activos fijos requeridos (equipos, maquinaria, software, adecuaciones), valor de adquisición y vida útil fiscal para depreciación lineal. |
| **5** | **Capital de Trabajo y Financiación** | Aporte propio de socios, subsidio / capital semilla (**Fondo Emprender SENA**) y configuración opcional de crédito bancario (monto, tasa EA y plazo). |
| **6** | **Parámetros Financieros** | Tasa de oportunidad / descuento (**WACC**), Impuesto a la Renta e **Inflación Anual Proyectada** (con botón rápido de tasas estándar Colombia: 12% / 35% / 4.5%). |

> Al finalizar el Paso 6, el aprendiz accede con un clic a **"Ver Resultados y Evaluador IA"**.

---

## Diapositiva 5 · Motor Financiero, Gráficos y Estados Financieros

Una vez parametrizado el modelo, el motor de cálculo en tiempo real entrega tres vistas integradas:

1. **Métricas y Gráficos Interactivos:**
   - Tarjetas KPI de **VAN**, **TIR vs. WACC**, **Punto de Equilibrio mensual** (unidades y facturación mínima) y **Payback** en meses.
   - Gráficos de evolución a 5 años (Ingresos vs. Costos vs. Utilidad Neta), flujo de caja acumulado del Año 1 mes a mes y comparación de estructura de inversión vs. financiación.
2. **Estados Financieros (EEFF) a 5 Años:**
   - **Estado de Resultados (P&L):** Ingresos operacionales, costos variables, margen bruto, OPEX, EBITDA, depreciación, EBIT, intereses financieros, impuestos y utilidad neta.
   - **Flujo de Caja Libre Proyectado:** Utilidad neta + ajuste por depreciación - amortización de deuda (cuota fija francesa) y saldo acumulado de caja.
   - **Proyección anual indexada a la inflación:** A partir del Año 2 hasta el Año 5, los ingresos operacionales, costos variables y gastos operacionales se proyectan aplicando la **tasa de inflación proyectada** definida en el Paso 6.
   - **Análisis de Sensibilidad (3 Escenarios):** Comparación automática entre escenario **Pesimista** (-20% ventas, +10% costos), **Base** y **Optimista** (+20% ventas, -5% costos).

---

## Diapositiva 6 · Evaluador Crítico y Mentor Financiero con IA

Integración de Inteligencia Artificial mediante backend seguro conectado al SDK oficial de Gemini (`gemini-4-hydrogen`):

- **Evaluador Automático de Planes de Negocio:**
  - Puntaje de viabilidad financiera (**0 a 100**) y veredicto (*Altamente Viable*, *Viable con Ajustes*, *Alto Riesgo Financiero*, *No Viable*).
  - Dictamen ejecutivo pedagógico con enfoque SENA / Fondo Emprender.
  - **Matriz DOFA Financiera** (Fortalezas, Debilidades, Oportunidades y Riesgos).
  - Lista priorizada de recomendaciones accionables para mejorar precios, costos o estructura de capital.
- **Chat Mentor Financiero Interactivo:**
  - Asistente conversacional que conoce en tiempo real los números exactos del proyecto del aprendiz para explicar conceptos (VAN, TIR, EBITDA, Punto de Equilibrio) con ejemplos de su propio sector y proponer tácticas concretas de mejora.

---

## Diapositiva 7 · Persistencia Segura (Firebase), Gestión de Proyectos y Evidencia PDF

El prototipo garantiza trazabilidad académica y continuidad operativa:

- **Guardado en la Nube con Firebase (Auth + Firestore):**
  - Inicio de sesión con cuenta Google (`Conectar Nube`) y sincronización en tiempo real por usuario propietario (`ownerId == request.auth.uid`) protegida con reglas de seguridad desplegadas y auditadas.
  - Gestor **"Mis Proyectos"** para crear, actualizar, buscar, duplicar, cargar o eliminar múltiples simulaciones desde cualquier sesión o dispositivo.
  - Migración en un clic de borradores locales hacia la nube e importación/exportación de respaldos en formato `.json`.
- **Limpieza Inmediata de Información:**
  - Inicio en blanco por defecto para nuevas sesiones, aviso rápido de limpieza al restaurar un borrador previo y botón permanente **"Limpiar Campos"** con confirmación segura.
- **Exportación de Evidencia Formal PDF / Impresión:**
  - Genera un documento institucional con el **logo oficial del SENA**, datos de ficha, centro, instructor, equipo de aprendices, métricas de viabilidad, tablas de inversión/financiación, EEFF a 5 años, dictamen de IA y espacio de firmas.

---

## Diapositiva 8 · Arquitectura Tecnológica del Prototipo

| Capa | Tecnologías Implementadas |
| :--- | :--- |
| **Frontend & UI** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, modo claro/oscuro, `ErrorBoundary` de recuperación |
| **Visualización de Datos** | Recharts (gráficos responsivos de áreas, líneas y barras comparativas) |
| **Motor Financiero** | Cálculo determinístico en TypeScript (VAN, TIR por Newton-Raphson/Bisección, amortización francesa, punto de equilibrio ponderado y sensibilidad) |
| **Backend & IA** | Node.js + Express (`server.ts`) con `@google/genai` (`gemini-4-hydrogen`) y validación estricta de respuestas JSON |
| **Base de Datos y Seguridad** | Firebase Authentication (Google Sign-In) + Cloud Firestore con reglas de acceso estricto por propietario (`firestore.rules`) y respaldo local en `localStorage` |

---

## Diapositiva 9 · Conclusión e Impacto Institucional

El **Simulador Modelo Financiero Plan de Negocio** convierte la formulación financiera en una experiencia **accesible, rigurosa y formativa** para la comunidad SENA:

- **Reduce la brecha técnica** entre la idea de negocio del aprendiz y su sustentación financiera profesional.
- **Eleva la calidad de las evidencias de aprendizaje** mediante cálculos confiables, análisis crítico con IA y reportes formales listos para evaluación.
- **Prepara mejores proyectos para Fondo Emprender**, fortaleciendo la cultura emprendedora y la empleabilidad tecnológica en los centros de formación del país.
