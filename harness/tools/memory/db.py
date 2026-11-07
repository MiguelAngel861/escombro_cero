"""Gestion de conexion SQLite para el sistema de memoria del harness.

Unico punto de conexion: provee PRAGMA foreign_keys = ON y
row_factory = sqlite3.Row, y cierra la conexion al salir del bloque `with`.
Reutilizado por manager.py y pruner.py para evitar duplicar _connect().

No importa ni conoce a manager, pruner ni cli (capa de dependencias del plan).
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path


@contextmanager
def get_connection(db_path: Path):
    """Abre una conexion SQLite configurada y la cierra al salir del bloque.

    El llamador controla el commit/rollback (no hay commit automatico).
    """
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
