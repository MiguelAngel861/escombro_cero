import sqlite3
from pathlib import Path

from .db import get_connection


class MemoryPruner:
    """Implementa el algoritmo de pruning y decaimiento de importancia

    para los elementos en la base de datos de memoria SQLite.
    """

    def __init__(self, db_path: Path):
        self.db_path = db_path

    def decay_and_prune(self, conn: sqlite3.Connection | None = None) -> dict:
        """Aplica un ciclo de decaimiento a la base de datos de memoria.

        Reglas de decaimiento:
        1. Los elementos con importancia 5 son permanentes y NUNCA decaen.
        2. Los elementos con importancia < 5 se decrementan en 1 punto.
        3. Cualquier elemento cuya importancia resultante sea <= 0 es eliminado.

        Si se pasa `conn`, usa esa conexión y no hace commit ni close
        (el llamador controla la transacción, necesario para atomicidad en consolidate_session).

        Retorna un diccionario con el recuento de elementos modificados y eliminados.
        """
        if not self.db_path.exists():
            return {
                "variables_decayed": 0,
                "variables_deleted": 0,
                "rules_decayed": 0,
                "rules_deleted": 0,
            }

        if conn is None:
            with get_connection(self.db_path) as _conn:
                stats = self._decay_and_prune_on(_conn)
                _conn.commit()
                return stats
        return self._decay_and_prune_on(conn)

    def _decay_and_prune_on(self, conn: sqlite3.Connection) -> dict:
        """Ejecuta el decaimiento sobre una conexión ya abierta.

        No hace commit ni close: el llamador controla la transacción.
        """
        cursor = conn.cursor()
        stats = {
            "variables_decayed": 0,
            "variables_deleted": 0,
            "rules_decayed": 0,
            "rules_deleted": 0,
        }
        try:
            # --- Procesar memory_variables ---
            # Usamos cursor.rowcount en vez de SELECT COUNT(*): SQLite devuelve
            # filas afectadas por DELETE/UPDATE, evitando 4 consultas extras.
            # 1. Eliminar elementos con importancia <= 1 (para evitar violar CHECK)
            cursor.execute("DELETE FROM memory_variables WHERE importance <= 1")
            stats["variables_deleted"] = cursor.rowcount

            # 2. Decrementar importancia de elementos restantes (2-4 decaen 1 punto)
            cursor.execute("""
                UPDATE memory_variables
                SET importance = importance - 1
                WHERE importance BETWEEN 2 AND 4
            """)
            stats["variables_decayed"] = cursor.rowcount

            # --- Procesar rules ---
            # 3. Eliminar reglas con importancia <= 1
            cursor.execute("DELETE FROM rules WHERE importance <= 1")
            stats["rules_deleted"] = cursor.rowcount

            # 4. Decrementar importancia de reglas restantes (2-4 decaen 1 punto)
            cursor.execute("""
                UPDATE rules
                SET importance = importance - 1
                WHERE importance BETWEEN 2 AND 4
            """)
            stats["rules_decayed"] = cursor.rowcount
        except Exception:
            conn.rollback()
            raise
        return stats
