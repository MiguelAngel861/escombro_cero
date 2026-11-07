__all__ = ["MemoryManager"]


def __getattr__(name):
    """Resuelve MemoryManager de forma perezosa.

    Evita importar manager al cargar el paquete, lo que provocaba un
    RuntimeWarning de runpy al ejecutar `python -m harness.tools.memory.manager`.
    """
    if name == "MemoryManager":
        from .manager import MemoryManager

        return MemoryManager
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
