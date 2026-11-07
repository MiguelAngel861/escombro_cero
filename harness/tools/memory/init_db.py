#!/usr/bin/env python3
import datetime
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MEMORY_DIR = ROOT / ".memory"
DB_PATH = MEMORY_DIR / "state.db"
# Cache: ROOT resuelto una vez al importar el modulo, no en cada llamada.

# Version actual del schema de la DB de memoria (decision G6).
SCHEMA_VERSION = "1.0.0"

# DDL compartido: init_db.py y MemoryManager lo reusan para auto-inicializacion (G6).
SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        summary TEXT
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS memory_variables (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        importance INTEGER CHECK (importance BETWEEN 1 AND 5),
        updated_at TEXT NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS decisions (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        option_chosen TEXT NOT NULL,
        justification TEXT,
        importance INTEGER CHECK (importance BETWEEN 1 AND 5),
        updated_at TEXT NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_description TEXT NOT NULL,
        importance INTEGER CHECK (importance BETWEEN 1 AND 5),
        created_at TEXT NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS file_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        change_type TEXT NOT NULL,
        reason TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    );
    """,
    # Tabla de versionado de schema (decision G6, fase F2).
    # Permite detectar si el schema de una DB existente esta desactualizado
    # y aplicar migraciones ALTER TABLE condicionales sin perder datos.
    """
    CREATE TABLE IF NOT EXISTS schema_version (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
    );
    """,
    # Indices para optimizar consultas de historial por sesion y archivo (decision G9).
    "CREATE INDEX IF NOT EXISTS idx_file_changes_session_id ON file_changes(session_id);",
    "CREATE INDEX IF NOT EXISTS idx_file_changes_file_path ON file_changes(file_path);",
    "CREATE INDEX IF NOT EXISTS idx_file_changes_session_file ON file_changes(session_id, file_path);",
    "CREATE INDEX IF NOT EXISTS idx_file_changes_file_updated ON file_changes(file_path, updated_at DESC);",
]


def create_tables(conn: sqlite3.Connection) -> None:
    """Ejecuta todos los CREATE TABLE IF NOT EXISTS sobre una conexión abierta."""
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    for statement in SCHEMA_STATEMENTS:
        cursor.execute(statement)
    conn.commit()


def register_schema_version(conn: sqlite3.Connection) -> None:
    """Registra la version actual del schema si aún no está registrada (decision G6)."""
    now = datetime.datetime.now(datetime.UTC).isoformat()
    conn.execute(
        """
        INSERT INTO schema_version (version, applied_at)
        VALUES (?, ?)
        ON CONFLICT(version) DO UPDATE SET applied_at = excluded.applied_at
        """,
        (SCHEMA_VERSION, now),
    )
    conn.commit()


def init_db():
    # 1. Crear directorio .memory
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Carpeta creada: {MEMORY_DIR}")

    # 2. Crear .gitkeep si no existe
    gitkeep_path = MEMORY_DIR / ".gitkeep"
    if not gitkeep_path.exists():
        gitkeep_path.write_text("# Keep directory tracked by Git\n")
        print(f"Archivo creado: {gitkeep_path}")

    # 3. Conectar a SQLite y crear tablas
    conn = sqlite3.connect(DB_PATH)
    try:
        create_tables(conn)
        register_schema_version(conn)
    finally:
        conn.close()
    print(f"Base de datos SQLite inicializada exitosamente en: {DB_PATH}")


if __name__ == "__main__":
    init_db()
