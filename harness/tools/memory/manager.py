import datetime
import sqlite3
from pathlib import Path

from .db import get_connection
from .init_db import create_tables, register_schema_version
from .pruner import MemoryPruner

# Cache: ROOT resuelto una vez al importar el modulo (evita .resolve().parents[3] por instancia).
_ROOT = Path(__file__).resolve().parents[3]


class MemoryManager:
    """Gestiona la persistencia de contexto, variables, decisiones y reglas

    en SQLite para el harness de agentes.
    """

    def __init__(self, db_path: Path | None = None):
        if db_path is None:
            # Por defecto, resuelve a .memory/state.db desde la raíz del proyecto
            self.db_path = _ROOT / ".memory" / "state.db"
        else:
            self.db_path = db_path
        # G6: auto-inicialización — garantiza que las tablas existan al primer uso
        self._ensure_initialized()

    def _ensure_initialized(self) -> None:
        """Crea el directorio y las tablas si faltan (auto-init, decision G6)."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        try:
            create_tables(conn)
            register_schema_version(conn)
        finally:
            conn.close()

    def _normalize_path(self, file_path: str) -> str:
        """Normaliza la ruta del archivo para ser relativa a la raíz del repositorio."""
        path = Path(file_path)
        if path.is_absolute():
            try:
                return str(path.relative_to(_ROOT))
            except ValueError:
                return str(path)
        return str(file_path)

    def get_memory_context(
        self, active_files: list[str] | None = None, min_importance: int = 3
    ) -> str:
        """Compila un resumen estructurado en Markdown con toda la información

        persistente útil para ser inyectada en el prompt del sistema.

        Args:
            active_files: rutas de archivos para inyectar su historial de cambios.
            min_importance: solo inyecta variables y reglas con importancia >= este valor
                (default 3). Usa 1 para ver todo, sin filtrar.
        """
        if not self.db_path.exists():
            return "<!-- No active memory found (.memory/state.db does not exist) -->"

        try:
            with get_connection(self.db_path) as conn:
                # 1. Obtener variables de estado (filtro por importancia + LIMIT duro, decision G8)
                vars_rows = conn.execute(
                    """
                    SELECT key, value, importance FROM memory_variables
                    WHERE importance >= ?
                    ORDER BY importance DESC, key ASC
                    LIMIT 20
                    """,
                    (min_importance,),
                ).fetchall()

                # 2. Obtener decisiones (LIMIT duro: maximo 10, decision G8)
                dec_rows = conn.execute(
                    """
                    SELECT id, category, title, option_chosen, justification, importance FROM decisions
                    ORDER BY id ASC
                    LIMIT 10
                    """
                ).fetchall()

                # 3. Obtener reglas aprendidas (filtro por importancia + LIMIT duro, decision G8)
                rules_rows = conn.execute(
                    """
                    SELECT rule_description, importance FROM rules
                    WHERE importance >= ?
                    ORDER BY importance DESC, id ASC
                    LIMIT 20
                    """,
                    (min_importance,),
                ).fetchall()

                # 4. Obtener resúmenes de sesiones recientes
                session_rows = conn.execute(
                    "SELECT session_id, created_at, summary FROM sessions ORDER BY created_at DESC LIMIT 5"
                ).fetchall()

                # 5. Obtener historial de archivos activos si se especificaron
                active_files_changes = []
                if active_files:
                    for f in active_files:
                        norm_path = self._normalize_path(f)
                        row = conn.execute(
                            """
                            SELECT fc.file_path, fc.change_type, fc.reason, fc.updated_at, fc.session_id, s.summary as session_summary
                            FROM file_changes fc
                            JOIN sessions s ON fc.session_id = s.session_id
                            WHERE fc.file_path = ?
                            ORDER BY fc.updated_at DESC
                            LIMIT 1
                            """,
                            (norm_path,),
                        ).fetchone()
                        if row:
                            active_files_changes.append(row)

        except sqlite3.OperationalError as e:
            return f"<!-- Error reading memory database: {e} -->"

        # Construir Markdown
        md = []
        md.append("# CONTEXTO DE MEMORIA DEL HARNESS (SESIONES ANTERIORES)\n")

        # Inyectar Variables
        if vars_rows:
            md.append("## Variables de Estado Activas")
            for r in vars_rows:
                md.append(
                    f"- **{r['key']}**: {r['value']} (Importancia: {r['importance']}/5)"
                )
            md.append("")

        # Inyectar Decisiones
        if dec_rows:
            md.append("## Decisiones de Arquitectura y Diseño")
            for r in dec_rows:
                md.append(
                    f"- **[{r['id']}] {r['category'].capitalize()}: {r['title']}**"
                )
                md.append(f"  * Opción elegida: {r['option_chosen']}")
                if r["justification"]:
                    md.append(f"  * Justificación: {r['justification']}")
                md.append(f"  * Importancia: {r['importance']}/5")
            md.append("")

        # Inyectar Reglas
        if rules_rows:
            md.append("## Reglas y Directrices de Calidad Aprendidas")
            for r in rules_rows:
                md.append(
                    f"- {r['rule_description']} (Importancia: {r['importance']}/5)"
                )
            md.append("")

        # Inyectar Historial de Archivos Activos
        if active_files_changes:
            md.append("## Historial de Edición de Archivos Activos")
            for r in active_files_changes:
                md.append(
                    f"- **{r['file_path']}** (Último cambio: {r['change_type']} en sesión {r['session_id']}):"
                )
                if r["reason"]:
                    md.append(f"  * Motivo: {r['reason']}")
                if r["session_summary"]:
                    md.append(f"  * Contexto de la sesión: {r['session_summary']}")
            md.append("")

        # Inyectar Historial de Sesiones
        if session_rows:
            md.append("## Resumen de Sesiones Recientes")
            for r in session_rows:
                md.append(
                    f"- **Sesión {r['session_id']}** ({r['created_at']}): {r['summary']}"
                )
            md.append("")

        return "\n".join(md).strip()

    # Métodos auxiliares para manipulación y pruebas
    def save_variable(
        self,
        key: str,
        value: str,
        importance: int = 3,
        conn: sqlite3.Connection | None = None,
    ) -> None:
        """Guarda o actualiza una variable en la memoria.

        Si se pasa `conn`, usa esa conexión y no hace commit (el llamador controla la transacción).
        """
        if not 1 <= importance <= 5:
            raise ValueError(
                f"importance debe estar entre 1 y 5, se recibio {importance}"
            )
        now = datetime.datetime.now(datetime.UTC).isoformat()
        if conn is None:
            with get_connection(self.db_path) as _conn:
                _conn.execute(
                    """
                    INSERT INTO memory_variables (key, value, importance, updated_at)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(key) DO UPDATE SET
                        value = excluded.value,
                        importance = excluded.importance,
                        updated_at = excluded.updated_at
                    """,
                    (key, value, importance, now),
                )
                _conn.commit()
            return
        conn.execute(
            """
            INSERT INTO memory_variables (key, value, importance, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                importance = excluded.importance,
                updated_at = excluded.updated_at
            """,
            (key, value, importance, now),
        )

    def save_decision(
        self,
        dec_id: str,
        category: str,
        title: str,
        option_chosen: str,
        justification: str,
        importance: int = 3,
        conn: sqlite3.Connection | None = None,
    ) -> None:
        """Guarda o actualiza una decisión de arquitectura.

        Si se pasa `conn`, usa esa conexión y no hace commit (el llamador controla la transacción).
        """
        if not 1 <= importance <= 5:
            raise ValueError(
                f"importance debe estar entre 1 y 5, se recibio {importance}"
            )
        now = datetime.datetime.now(datetime.UTC).isoformat()
        if conn is None:
            with get_connection(self.db_path) as _conn:
                _conn.execute(
                    """
                    INSERT INTO decisions (id, category, title, option_chosen, justification, importance, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        category = excluded.category,
                        title = excluded.title,
                        option_chosen = excluded.option_chosen,
                        justification = excluded.justification,
                        importance = excluded.importance,
                        updated_at = excluded.updated_at
                    """,
                    (
                        dec_id,
                        category,
                        title,
                        option_chosen,
                        justification,
                        importance,
                        now,
                    ),
                )
                _conn.commit()
            return
        conn.execute(
            """
            INSERT INTO decisions (id, category, title, option_chosen, justification, importance, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                category = excluded.category,
                title = excluded.title,
                option_chosen = excluded.option_chosen,
                justification = excluded.justification,
                importance = excluded.importance,
                updated_at = excluded.updated_at
            """,
            (dec_id, category, title, option_chosen, justification, importance, now),
        )

    def save_rule(
        self,
        rule_description: str,
        importance: int = 3,
        conn: sqlite3.Connection | None = None,
    ) -> None:
        """Guarda una nueva regla aprendida en la base de datos.

        Si se pasa `conn`, usa esa conexión y no hace commit (el llamador controla la transacción).
        """
        if not 1 <= importance <= 5:
            raise ValueError(
                f"importance debe estar entre 1 y 5, se recibio {importance}"
            )
        now = datetime.datetime.now(datetime.UTC).isoformat()
        if conn is None:
            with get_connection(self.db_path) as _conn:
                _conn.execute(
                    """
                    INSERT INTO rules (rule_description, importance, created_at)
                    VALUES (?, ?, ?)
                    """,
                    (rule_description, importance, now),
                )
                _conn.commit()
            return
        conn.execute(
            """
            INSERT INTO rules (rule_description, importance, created_at)
            VALUES (?, ?, ?)
            """,
            (rule_description, importance, now),
        )

    def save_session(
        self, session_id: str, summary: str, conn: sqlite3.Connection | None = None
    ) -> None:
        """Guarda un resumen de sesión de chat en el historial.

        Si se pasa `conn`, usa esa conexión y no hace commit (el llamador controla la transacción).
        """
        now = datetime.datetime.now(datetime.UTC).isoformat()
        if conn is None:
            with get_connection(self.db_path) as _conn:
                _conn.execute(
                    """
                    INSERT INTO sessions (session_id, created_at, summary)
                    VALUES (?, ?, ?)
                    ON CONFLICT(session_id) DO UPDATE SET
                        summary = excluded.summary
                    """,
                    (session_id, now, summary),
                )
                _conn.commit()
            return
        conn.execute(
            """
            INSERT INTO sessions (session_id, created_at, summary)
            VALUES (?, ?, ?)
            ON CONFLICT(session_id) DO UPDATE SET
                summary = excluded.summary
            """,
            (session_id, now, summary),
        )

    def save_file_change(
        self,
        session_id: str,
        file_path: str,
        change_type: str,
        reason: str,
        conn: sqlite3.Connection | None = None,
    ) -> None:
        """Guarda o actualiza el registro de un archivo modificado en la sesión.

        Aplica normalización de ruta (G2) y mantiene un registro único acumulativo
        por archivo por sesión (G4).

        Si se pasa `conn`, usa esa conexión y no hace commit (el llamador controla la transacción).
        """
        now = datetime.datetime.now(datetime.UTC).isoformat()
        norm_path = self._normalize_path(file_path)
        if conn is None:
            with get_connection(self.db_path) as _conn:
                # Consultar si ya existe un registro en esta misma sesión para el archivo
                row = _conn.execute(
                    "SELECT id FROM file_changes WHERE session_id = ? AND file_path = ?",
                    (session_id, norm_path),
                ).fetchone()

                if row:
                    # Si existe, actualizamos el tipo de cambio y la justificación
                    _conn.execute(
                        """
                        UPDATE file_changes
                        SET change_type = ?, reason = ?, updated_at = ?
                        WHERE id = ?
                        """,
                        (change_type, reason, now, row["id"]),
                    )
                else:
                    # Si no existe, creamos el registro relacional
                    _conn.execute(
                        """
                        INSERT INTO file_changes (session_id, file_path, change_type, reason, updated_at)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (session_id, norm_path, change_type, reason, now),
                    )
                _conn.commit()
            return
        # Consultar si ya existe un registro en esta misma sesión para el archivo
        row = conn.execute(
            "SELECT id FROM file_changes WHERE session_id = ? AND file_path = ?",
            (session_id, norm_path),
        ).fetchone()

        if row:
            # Si existe, actualizamos el tipo de cambio y la justificación
            conn.execute(
                """
                UPDATE file_changes
                SET change_type = ?, reason = ?, updated_at = ?
                WHERE id = ?
                """,
                (change_type, reason, now, row["id"]),
            )
        else:
            # Si no existe, creamos el registro relacional
            conn.execute(
                """
                INSERT INTO file_changes (session_id, file_path, change_type, reason, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (session_id, norm_path, change_type, reason, now),
            )

    def get_last_change_for_file(self, file_path: str) -> dict | None:
        """Obtiene los detalles del último cambio registrado para un archivo."""
        norm_path = self._normalize_path(file_path)
        with get_connection(self.db_path) as conn:
            row = conn.execute(
                """
                SELECT fc.session_id, fc.file_path, fc.change_type, fc.reason, fc.updated_at as created_at, s.summary as session_summary
                FROM file_changes fc
                JOIN sessions s ON fc.session_id = s.session_id
                WHERE fc.file_path = ?
                ORDER BY fc.updated_at DESC
                LIMIT 1
                """,
                (norm_path,),
            ).fetchone()
            if row:
                return dict(row)
            return None

    def consolidate_session(
        self,
        session_id: str,
        summary: str,
        variables_to_update: list[dict] | None = None,
        decisions_to_update: list[dict] | None = None,
        rules_to_update: list[dict] | None = None,
        file_changes_to_update: list[dict] | None = None,
    ) -> dict:
        """Consolida la sesión actual en la base de datos de memoria.

        Ejecuta todo dentro de una sola transacción SQLite (atomicidad, decision G7):
        1. Guarda el resumen de la sesión actual en la tabla 'sessions'.
        2. Aplica el decaimiento y descarte de importancia (pruning) sobre variables y reglas existentes.
        3. Inserta/actualiza las nuevas variables, decisiones y reglas surgidas de esta sesión.
        4. Inserta/actualiza los registros de cambios de archivos.

        Si cualquier paso falla, se hace rollback y no queda estado parcial.

        Retorna las estadísticas del pruning realizado.
        """
        with get_connection(self.db_path) as conn:
            try:
                # 1. Guardar sesión
                self.save_session(session_id, summary, conn=conn)

                # 2. Ejecutar decaimiento y descarte (usa la misma conexión)
                pruner = MemoryPruner(self.db_path)
                prune_stats = pruner.decay_and_prune(conn=conn)

                # 3. Guardar actualizaciones solicitadas
                if variables_to_update:
                    for v in variables_to_update:
                        # G5: respetar importance entrante (default 3), ya no hardcodeado
                        self.save_variable(
                            v["key"],
                            v["value"],
                            importance=v.get("importance", 3),
                            conn=conn,
                        )

                if decisions_to_update:
                    for d in decisions_to_update:
                        self.save_decision(
                            dec_id=d["id"],
                            category=d["category"],
                            title=d["title"],
                            option_chosen=d["option_chosen"],
                            justification=d.get("justification", ""),
                            importance=d.get("importance", 3),
                            conn=conn,
                        )

                if rules_to_update:
                    for r in rules_to_update:
                        self.save_rule(
                            rule_description=r["rule_description"],
                            importance=r.get("importance", 3),
                            conn=conn,
                        )

                # 4. Registrar cambios de archivos
                if file_changes_to_update:
                    for f in file_changes_to_update:
                        self.save_file_change(
                            session_id=session_id,
                            file_path=f["file_path"],
                            change_type=f["change_type"],
                            reason=f.get("reason", ""),
                            conn=conn,
                        )

                conn.commit()
            except Exception:
                conn.rollback()
                raise

        return prune_stats
