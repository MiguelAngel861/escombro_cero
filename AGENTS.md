# AGENTS.md

Directivas esenciales para agentes con sistema harness.

## Estructura requerida

```
harness/
├── docs/
│   ├── MEMORY.md       # Sistema memoria persistente SQLite
│   ├── PLANNING.md     # Sistema planes y grilling
│   └── plans/          (crear si no existe)
└── tools/
    ├── memory/
    └── plans/
```

## Comandos inmediatos

```bash
# Inicializar memoria
python3 harness/tools/memory/init_db.py

# Contexto memoria
./harness/tools/memory/memory.sh get-context

# Validar planes
uv run --with jsonschema harness/tools/plans/plan_validate.py

# Guardar decisión
./harness/tools/memory/memory.sh save-decision --id "G1" --title "..." --importance 5

# Pruning manual
./harness/tools/memory/memory.sh prune
```

## Reglas obligatorias

1. **Validar siempre** con `uv run --with jsonschema` antes de aprobar
2. **IDs decisiones**: `^[GDTMPB][0-9]+[a-z]?$` (G=arquitectura, D=cleanup, T=tests, M=config, P=deploy, B=bug)
3. **Niveles importancia**: 5=permanente, 1=eliminar inmediato
4. **Cerrar ramas** después de merge a dev; solo `dev` y `main`
5. **No reutilizar IDs** de decisiones revocadas

## Referencias documentación

- `harness/docs/MEMORY.md` - Inicializar memoria y gestiona persistencia
- `harness/docs/PLANNING.md` - Reglas de planificación, grilling y validación

## Integración rápida

1. Incluir este AGENTS.md en la raíz
2. Verificar `harness/docs/MEMORY.md` y `harness/docs/PLANNING.md`
3. Si no existen, crear estructura y ejecutar setup inicial

Solo lo esencial para operar el harness inmediatamente.