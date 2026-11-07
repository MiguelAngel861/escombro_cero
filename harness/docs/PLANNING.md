# PLANNING.md

Manual del sistema de planes de BareDo: reglas, grilling, validación y mejora continua. Leelo antes de tocar código de planes (AGENTS.md enlaza aquí de forma obligatoria).

---

## 2. Sistema de planes

### 2.1 Layout

```
harness/
├── docs/
│   ├── plans/                         # Un plan por archivo
│   │   └── harness-001-memory-system.json
│   ├── templates/                    # Reusable por todo plan
│   │   ├── plan.schema.json          # Schema obligatorio
│   │   ├── plan.template.json
│   │   └── plan.example.json
│   ├── MEMORY.md                     # Manual del sistema de memoria
│   └── PLANNING.md                   # Manual del sistema de planes
└── tools/                            # Scripts del harness agrupados por feature
    ├── memory/                       # Feature: Memoria Persistente SQLite
    │   ├── manager.py
    │   ├── pruner.py
    │   └── init_db.py
    └── plans/                        # Feature: Validación de planes BareDo
        └── plan_validate.py
```

### 2.2 Reglas

1. Un plan = un JSON en `harness/docs/plans/`, nombrado `{dominio}-{NNN}-{slug}.json` (ej: `harness-002-file-change-tracking.json`). El tipo de plan va en `plan.tipo`, no en el nombre. Si la carpeta `harness/docs/plans/` no existe, se debe crear automáticamente.
2. `plan.id` debe ser idéntico al nombre del archivo sin extensión (ej: `harness-002-file-change-tracking`).
3. **Un plan que no cumple el schema no existe.** Validar SIEMPRE (sección 3).
4. Durante el grilling el plan se edita **solo** al cerrar decisiones. Cada edición crea una entrada en `plan.historial` (append-only: fecha + versión + cambio) **y** actualiza `plan.fecha_actualizacion` y `plan.version`.
5. `plan.estado` ∈ `draft | aprobado | en_progreso | completado | cancelado | pausado`. Transiciones: `draft` nace en grilling; `aprobado` al cerrar grilling + validación (3); `en_progreso` al iniciar F1; `completado` al cerrar la última fase; `pausado`/`cancelado` por decisión del dueño del plan.
6. Decisiones con prefijo de categoría: `G`=arquitectura/grilling, `D`=duplicación/cleanup, `T`=tests, `M`=migraciones/config, `P`=deploy, `B`=bug/sospechoso. Pattern del schema: `^[GDTMPB][0-9]+[a-z]?$`. Las tareas referencian decisiones en `decisiones_ref`. **No romper referencias.**
7. Fases secuenciales. `F0` es opcional y se reserva a precondiciones (ej: congelar behavior con tests antes de tocar código); el resto `F1`…`Fn`. Cada fase: `rama`, tareas, gate (min 1 criterio) y `depende_de`.
8. `$schema` apunta a `../templates/plan.schema.json`. Cambiar la ruta = actualizar todos los planes.

### 2.3 Secciones del schema

| Sección | Para qué |
|---|---|
| `plan` | Metadatos: id (= nombre de archivo), tipo, versión, estado, autor, fechas, prefijo de ramas |
| `alcance` | Objetivo, contexto, `in_scope`/`out_of_scope` (evita scope creep) |
| `decisiones` | Cada decisión con opciones, justificación, impacto, archivos |
| `estructura` | Árbol ASCII, contrato de dependencias, archivos nuevos/modif/eliminados |
| `fases` | Roadmap ejecutable con gates bloqueantes |
| `tests` | Stack, layout, fixtures, config pytest/ruff, gate de cobertura |
| `riesgos` | Probabilidad/impacto + mitigación |
| `metricas_exito` | Condiciones verificables del cumplimiento |
| `historial` | Log append-only |

---

## 3. Validación (OBLIGATORIA antes de aprobar un plan)

Correr la validación usando `uv` desde la raíz del workspace:

```bash
uv run --with jsonschema harness/tools/plans/plan_validate.py
```

El script verifica:
- Schema cumple draft 2020-12.
- Templates (excepto `plan.schema.json`) validan contra el schema.
- Planes en `harness/docs/plans/` validan contra el schema.
- En planes: `plan.id` == nombre de archivo sin extensión.
- Referencias: `decisiones_ref` → decisiones, `depende_de` → fases.

Reglas:
- Salida debe ser `schema: valido` + `OK` + `REFS ...: OK` en todo. Cualquier `FAIL`/`ID`/`REF` bloquea avanzar.
- Los placeholders del template deben cumplir los `pattern`/`format` del schema (nada de cadenas vacías).
- Si se requieren dependencias de validación adicionales, se pueden especificar usando el flag `--with` de `uv run` (ej: `uv run --with jsonschema,otro-paquete ...`).
- La validación es pre-condición para materializar (4.5.6 "Apruebas") y para cada merge de fase del bucle (5).

---

## 4. Sesiones de grilling

GRILLING = interrogatorio para construir/afinar un plan.

### 4.1 Cuándo
- El usuario pide planear un cambio planificable (refactor, migración, feature, cleanup, deploy).
- Un plan de `harness/docs/plans/` tiene fases sin decisiones.
- El usuario pide "grilling", "interrogatorio" o "sharpening".

**No dispara grilling** (plan directo):
- Un cambio trivial y reversible que no amerita fases ni decisiones (ej: renombrar un helper).
- Migración mecánica sin trade-offs (ej: actualizar versión de una lib sin cambios de API).
- Añadir una dep simple (`uv add`) sin arquitectura involucrada.

### 4.2 Antes de preguntar: inventario en silencio
1. **Lee TODO el código afectado** (o el plan existente). Nada de preguntar sobre suposiciones.
2. Inventaría: estructura, duplicación, código muerto, bugs latentes, imports sin usar.
3. Caza patrones repetidos (try/except idénticos, respuestas construidas igual, helpers por ruta).
4. Propón el mapa de capas actual y contratos de dependencia **antes** de las preguntas.
5. Prepara las rondas AVISANDO qué temas vienen: "ronda 1: arquitectura de capas; ronda 2: persistencia".
6. Si hay un plan ya escrito, señala primero sus **huecos reales** (decisiones sin sustento, fases sin gate) antes de proponer lo nuevo.

### 4.3 Formato de las rondas
- Rondas numeradas, agrupadas por tema pertinente al plan (arquitectura, persistencia, tests, deploy, seguridad, UX). Solo temas que toca el alcance.
- **Máx 3-4 preguntas por ronda.** Más de eso: la sesión se vuelve examen. Reordenar temas que no entran, para otra ronda.
- Una pregunta por turno, o bloque numerado con opción "no aplica/indiferente".
- Cada pregunta trae, EN ESTE orden: (1) contexto con cita real (`ruta:línea`), (2) las opciones con trade-offs honestos, (3) `(Recomendado)` cuando exista una.
- Las opciones van de la más conservadora a la más intrusiva; el `(Recomendado)` siempre va primero entre las marcadas.
- No preguntes lo que ya se desprende de una decisión previa.
- Al cerrar una pregunta "no aplica": anotar la decisión igualmente *para descarte* (evita que reaparezca y documenta el porqué).
- **Tope de sesión: 4 rondas.** Si al cerrarlas quedan temas abiertos, cerrar con el estado logrado y proponer una segunda sesión con el inventario de pendientes. No alargar la misma sesión más de ~60 min efectivos.

### 4.4 Registro de decisiones
- Cerrar cada decisión en voz alta: *"Anotado G3: sesión explícita pasada al repo"*.
- Numerar por categoría (2.2 punto 6). El id resultante debe cumplir `^[GDTMPB][0-9]+[a-z]?$` (ej: `G3`, `D12`, `T1a`). Los números no necesitan ser contiguos; lo prohibido es reutilizar un id.
- Llevar la **tabla de decisiones en la conversación** (id, categoría, elegida, justificación) y consolidarla en el JSON al cierre (4.5). Nada de editar `harness/docs/plans/*.json` con el grilling abierto.
- Si el usuario revierte una decisión: cerrar la nueva con id distinto y **mencionar la anterior** (ej: *"D5 reemplaza a D2: cambiamos a capas sin DTO"*). Nunca reutilizar el id de la revocada.
- Si dos opciones empatan: preguntar una ronda más con un criterio de desempate (costo de implementación, esfuerzo de testeo, riesgo) y cerrar. No dejar la decisión abierta.
- Al final: consolidar tabla de decisiones + estructura + fases → plan JSON.

### 4.5 Cierre
1. Tabla de TODAS las decisiones (incluidas las descartadas, para que conste el porqué).
2. Árbol de carpetas objetivo.
3. Mapeo archivo por archivo (nuevo/modificado/eliminado).
4. Fases con gates y dependencias.
5. **Pregunta de cierre obligatoria**: ¿apruebas el plan, lo matizas o lo persistes?
6. Interpretación de las respuestas:
   - **Apruebas** → materializar JSON + validar (sección 3) + registrar en `historial`.
   - **Matizas** → aplicar el ajuste indicado y volver a 4.3/4.4 según el tema; repetir la pregunta de cierre hasta que sea un sí.
   - **Persistes** → no se escribe JSON; queda la conversación como registro. El pedido futuro de "cerrar" retoma desde este punto.

### 4.6 Antipatrones

**De preparación**
- Preguntar lo que se responde leyendo código.
- Empezar a preguntar sin proponer el mapa de capas actual (4.2.4).

**De proceso**
- Escribir el plan sin grilling (salvo pedido explícito).
- Editar el plan JSON con el grilling abierto.
- Saltarse la pregunta de cierre obligatoria (4.5.5).
- Dejar una pregunta sin cerrar ("esa la vemos después").
- Reutilizar un id de decisión revocada (4.4).

**De honestidad**
- Dar por elegida la opción "(Recomendada)" sin confirmación del usuario.
- Meter decisiones no preguntadas (inventadas).
- Ocultar trade-offs de la opción recomendada para que "parezca obvia".
- Dejar un plan sin validar.

---

## 5. Flujo estándar

```
1. Pedido de planear
2. Leer código + inventariar (4.2)
3. Grilling por rondas (4.3)
4. Cerrar decisiones (4.4)
5. Consolidar y pedir aprobación (4.5)
6. Materializar harness/docs/plans/{dominio}-{NNN}-{slug}.json (crear la carpeta si no existe)
7. Validar con uv/jsonschema (sección 3)
8. Registrar en historial y setear estado aprobado
9. Implementar por fases (bucle):
   a. checkout dev && branch de fase (5.1.1)
   b. implementar tareas de la fase en su rama
   c. gate cumplido → merge a dev + borrar rama (5.1)
   d. registrar cierre de fase en plan.historial (5.1.8)
10. Última fase cerrada → plan.estado = completado
```

### 5.1 Política de ramas (regla explícita)

Una fase = una rama efímera. Al terminar la fase, la rama SE ELIMINA. Solo viven `dev` y `main`.

1. Rama por fase: `git checkout dev && git checkout -b {fases[n].rama}` (ej: `feature/f1-persistence-layer`, `refactor/f2-layout`, `migracion/f3-db`; el prefijo se toma de `plan.branches_prefix`).
2. Todo el WIP de la fase va a esa rama. Prohibido commitear a `dev`/`main` durante la fase.
3. Gate cumplido → merge a `dev` (merge --no-ff).
4. Después del merge, la rama muere: `git branch -d` + `git push origin --delete`.
5. Si queda una rama de fase en remoto al avanzar, es un error, corregirlo antes de la próxima fase.
6. `main` solo recibe merges desde `dev` (release en hitos del ROADMAP). Nunca rama a rama.
7. El plan documenta `rama` por fase pero NO guarda estado git. Auditar con `git branch --merged` / `git status`.
8. Al cerrar cada fase: registrar en `plan.historial` (fase cerrada + version bump) y, si es la última, marcar `plan.estado = completado`.

Checklist al cerrar fase:

```bash
# 0. Auditar que solo existan dev y main antes de empezar
git branch --list   # solo dev y main

# 1. Posicionarse en dev (traer cambios solo si hay remoto/upstream)
git checkout dev
if git remote | grep -q .; then git pull; fi

# 2. Mergear la rama de fase a dev (--no-ff)
git merge --no-ff <fase-rama>

# 3. Borrar la rama de fase (local y, si aplica, remota)
git branch -d <fase-rama>
if git remote | grep -q .; then git push origin --delete <fase-rama>; fi

# 4. Subir dev solo si hay remoto
if git remote | grep -q .; then git push origin dev; fi

# 5. Auditar que solo queden dev y main
git branch --list   # solo dev y main
```

Y en `harness/docs/plans/{plan}.json`: añadir entrada a `plan.historial` con version bump (5.1.8).

---

## 7. Mejora continua del sistema de planes

El sistema (schema + template + example + este manual) se refina por **ciclos de 5 pasadas** cuando aparece fricción (un plan incomoda al escribirse, la validación exige retoques repetidos, el grilling saca a la luz campos que sobran o faltan).

### 7.1 Cuándo correr un ciclo
- Fricción al escribir un plan (placeholders raros, campos confusos, redacción redundante).
- La validación pide los mismos arreglos en más de un plan (señal de schema pobre).
- El grilling revela decisiones sin categoría, gates sin métrica o setups repetidos.
- Naming inconsistente (archivos, prefijos de rama, prefijos de decisiones).

### 7.2 Las 5 pasadas de cada ciclo
1. **Estructura** — coherencia de nombres y layout real vs documentado.
2. **Contrato del schema** — `required` correcto, patterns precisos, descripciones útiles, sin campos muertos.
3. **Template/example** — placeholders cumplen el schema, ejemplos creíbles y referencias (`decisiones_ref`) sin romper.
4. **Redacción** — manual claro, sin jerga, con flujos verificables.
5. **Cierre** — validar (sección 3), revisar `git diff`, registrar el ciclo en `historial` de los planes afectados.

Reglas:
- Validar al final de cada pasada, no solo al cierre.
- Un ciclo no reescribe la semántica retroactivamente; si se renombra un campo, actualizar `historial`.
- Terminar preguntando al usuario: ¿otro ciclo, o cierre y commit?