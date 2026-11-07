"""Interfaz de linea de comandos (argparse) que invoca MemoryManager.

Punto de entrada para memory.sh. Importable sin efectos secundarios de argparse.
"""

import argparse
import sys

from .manager import MemoryManager
from .pruner import MemoryPruner


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="CLI para gestionar la memoria persistente del harness."
    )
    subparsers = parser.add_subparsers(
        dest="command", required=True, help="Subcomando a ejecutar"
    )

    # Command: get-context
    subparsers.add_parser(
        "get-context", help="Obtiene el contexto consolidado de memoria en Markdown"
    )

    # Command: save-variable
    var_parser = subparsers.add_parser(
        "save-variable", help="Guarda o actualiza una variable"
    )
    var_parser.add_argument("--key", required=True, help="Clave de la variable")
    var_parser.add_argument("--value", required=True, help="Valor de la variable")
    var_parser.add_argument(
        "--importance",
        type=int,
        default=3,
        choices=range(1, 6),
        help="Nivel de importancia (1-5)",
    )

    # Command: save-decision
    dec_parser = subparsers.add_parser(
        "save-decision", help="Guarda o actualiza una decisión"
    )
    dec_parser.add_argument("--id", required=True, help="Identificador único (ej: G1)")
    dec_parser.add_argument("--category", required=True, help="Categoría")
    dec_parser.add_argument("--title", required=True, help="Título descriptivo")
    dec_parser.add_argument("--option", required=True, help="Opción elegida")
    dec_parser.add_argument(
        "--justification", default="", help="Justificación de la elección"
    )
    dec_parser.add_argument(
        "--importance",
        type=int,
        default=3,
        choices=range(1, 6),
        help="Nivel de importancia (1-5)",
    )

    # Command: save-rule
    rule_parser = subparsers.add_parser(
        "save-rule", help="Guarda una nueva regla aprendida"
    )
    rule_parser.add_argument(
        "--description", required=True, help="Descripción textual de la regla"
    )
    rule_parser.add_argument(
        "--importance",
        type=int,
        default=3,
        choices=range(1, 6),
        help="Nivel de importancia (1-5)",
    )

    # Command: prune
    subparsers.add_parser(
        "prune", help="Ejecuta el decaimiento y limpieza de elementos obsoletos"
    )

    args = parser.parse_args(argv)
    manager = MemoryManager()

    if args.command == "get-context":
        print(manager.get_memory_context())
    elif args.command == "save-variable":
        manager.save_variable(args.key, args.value, args.importance)
        print(f"Variable '{args.key}' guardada exitosamente.")
    elif args.command == "save-decision":
        manager.save_decision(
            dec_id=args.id,
            category=args.category,
            title=args.title,
            option_chosen=args.option,
            justification=args.justification,
            importance=args.importance,
        )
        print(f"Decisión '{args.id}' guardada exitosamente.")
    elif args.command == "save-rule":
        manager.save_rule(args.description, args.importance)
        print("Regla guardada exitosamente.")
    elif args.command == "prune":
        pruner = MemoryPruner(manager.db_path)
        stats = pruner.decay_and_prune()
        print(f"Pruning completado: {stats}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
