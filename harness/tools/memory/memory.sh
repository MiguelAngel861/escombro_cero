#!/usr/bin/env bash
# Wrapper para facilitar el uso del CLI de la memoria del harness

# Obtener la ruta absoluta del directorio del script y del root del proyecto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/../../.." && pwd )"

# Ejecutar con PYTHONPATH adecuado y pasar todos los argumentos.
# `exec` reemplaza el shell por python3 para no dejar un proceso padre innecesario.
PYTHONPATH="$ROOT_DIR" exec python3 -m harness.tools.memory.cli "$@"
