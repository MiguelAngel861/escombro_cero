# MEMORY.md

Manual del sistema de memoria persistente de BareDo: arquitectura, esquemas, niveles de importancia y ciclo de vida de la memoria. Leelo para entender cómo persiste y decae la información entre sesiones de agentes.

---

## 1. Propósito

El sistema de memoria persistente tiene como objetivo mantener el contexto relevante del proyecto entre diferentes ejecuciones de agentes. Evita la pérdida de conocimiento sobre decisiones tomadas, reglas descubiertas, estado de variables clave y cambios realizados en los archivos. Utiliza una base de datos local SQLite ubicada en `.memory/state.db`.

---

## 2. Estructura de la Base de Datos

La base de datos se compone de cinco tablas principales:

### 2.1 sessions
Registra cada sesión de trabajo iniciada por el agente.
* `session_id` (TEXT, PRIMARY KEY): Identificador único de la sesión (usualmente un UUID o timestamp).
* `created_at` (TEXT): Fecha y hora de creación en formato ISO 8601 (`YYYY-MM-DDTHH:MM:SS-TZ`).
* `summary` (TEXT): Resumen de los logros y el estado al finalizar la sesión.

### 2.2 memory_variables
Guarda variables globales de estado del entorno de desarrollo.
* `key` (TEXT, PRIMARY KEY): Nombre único de la variable.
* `value` (TEXT): Valor guardado.
* `importance` (INTEGER): Nivel de importancia (1 a 5).
* `updated_at` (TEXT): Fecha y hora de última actualización.

### 2.3 decisions
Consolida las decisiones de arquitectura, testing y diseño acordadas durante el grilling u otras sesiones.
* `id` (TEXT, PRIMARY KEY): Identificador que cumple el patrón de categoría (ej. `G1`, `D5`, `T3`).
* `category` (TEXT): Categoría de la decisión (arquitectura, cleanup, tests, migraciones, etc.).
* `title` (TEXT): Título descriptivo de la decisión.
* `option_chosen` (TEXT): La opción elegida.
* `justification` (TEXT): Motivo y justificación técnica del acuerdo.
* `importance` (INTEGER): Nivel de importancia (1 a 5).
* `updated_at` (TEXT): Fecha y hora del registro.

### 2.4 rules
Colección de reglas de desarrollo aprendidas o especificadas por el usuario.
* `id` (INTEGER, PRIMARY KEY AUTOINCREMENT): Identificador autoincremental.
* `rule_description` (TEXT): Contenido textual de la regla o restricción.
* `importance` (INTEGER): Nivel de importancia (1 a 5).
* `created_at` (TEXT): Fecha de registro de la regla.

### 2.5 file_changes
Historial de archivos modificados durante una sesión, facilitando el análisis de impacto.
* `id` (INTEGER, PRIMARY KEY AUTOINCREMENT): Identificador incremental.
* `session_id` (TEXT, FOREIGN KEY): Referencia a la sesión en la que se realizó el cambio.
* `file_path` (TEXT): Ruta relativa del archivo modificado.
* `change_type` (TEXT): Tipo de cambio (adición, modificación, eliminación).
* `reason` (TEXT): Justificación del cambio en ese archivo.
* `updated_at` (TEXT): Marca de tiempo del cambio.

---

## 3. Niveles de Importancia (1 a 5)

La importancia determina la prioridad con la que la información es inyectada en el contexto del agente y define su ciclo de vida (cuándo será eliminada por obsolescencia).

| Nivel | Clasificación | Propósito y Criterio | Comportamiento frente al Decaimiento |
|---|---|---|---|
| **5** | Permanente | Reglas críticas del sistema, decisiones de arquitectura base o variables esenciales de configuración. | **Inmune.** Nunca decae y nunca se elimina de forma automática. |
| **4** | Alta | Decisiones mayores de diseño de componentes, flujos complejos o variables operativas importantes de largo plazo. | Decae lentamente. Requiere 4 ciclos de pruning para desaparecer. |
| **3** | Media | Decisiones de implementación secundaria, librerías accesorias o configuraciones temporales de mediana duración. | Decae a nivel 2 en el siguiente ciclo. |
| **2** | Baja | Preferencias menores, decisiones locales de un módulo específico o variables de corta duración. | Decae a nivel 1 en el siguiente ciclo. |
| **1** | Mínima / Efímera | Contexto de soporte inmediato, notas de debugging rápido o variables desechables. | **Eliminación inmediata** en el siguiente ciclo de pruning. |

---

## 4. Ciclo de Vida y Pruning (Decaimiento)

Para evitar la saturación del contexto del agente con información antigua u obsoleta, el sistema implementa un mecanismo de pruning a través del componente `MemoryPruner`.

### 4.1 Reglas del Algoritmo de Pruning
Cada vez que se ejecuta el proceso de decaimiento:
1. Las entradas con importancia **5** no sufren cambios.
2. Las entradas con importancia entre **2** y **4** ven reducido su nivel de importancia en **1** punto.
3. Las entradas con importancia **1** son eliminadas permanentemente de las tablas `memory_variables` y `rules`.

### 4.2 Cuándo ejecutar el Pruning
* Se recomienda ejecutar el pruning al finalizar fases mayores de refactorización o desarrollo.
* Puede ser ejecutado manualmente o invocado como parte de las tareas de cierre de un plan aprobado.

---

## 5. Integración en el Flujo de Trabajo del Agente

Para interactuar con la base de datos de manera directa desde la terminal de forma más ágil, se provee un script wrapper en bash `./harness/tools/memory/memory.sh`. Este script configura el `PYTHONPATH` y delega todos los argumentos al CLI.

### 5.1 Ejemplo de Inicialización
Antes de usar la memoria en un nuevo proyecto, se debe inicializar la base de datos vacía ejecutando:
```bash
python3 harness/tools/memory/init_db.py
```

### 5.2 Recuperar Contexto en el Prompt del Sistema
Para recuperar el contexto consolidado de memoria en formato Markdown:
```bash
./harness/tools/memory/memory.sh get-context
```
Esto genera una salida estructurada con las variables activas, decisiones vigentes y reglas aplicables.

### 5.3 Registrar una Nueva Decisión
Cuando se apruebe una decisión en la sesión de grilling, se registra ejecutando:
```bash
./harness/tools/memory/memory.sh save-decision \
    --id "G2" \
    --category "arquitectura" \
    --title "Uso de SQLite para persistencia" \
    --option "Base de datos SQLite local" \
    --justification "Permite portabilidad inmediata sin dependencias de servicios externos." \
    --importance 5
```

### 5.4 Registrar una Regla Aprendida
Para guardar una nueva regla o restricción descubierta durante el desarrollo:
```bash
./harness/tools/memory/memory.sh save-rule \
    --description "No utilizar dependencias globales fuera de uv en scripts del harness." \
    --importance 4
```

### 5.5 Ejecutar Pruning Manual
Para forzar el ciclo de decaimiento de importancia sobre la base de datos:
```bash
./harness/tools/memory/memory.sh prune
```
