import * as store from "./store.js";

export function initWebShell(pageId: string, pageTitle: string): store.SesionWeb {
  store.ensureSeed();

  // Sesión web por defecto (admin para facilidad de demo en el pitch si no hay sesión previa)
  let sesion = store.laSesionWeb();
  if (!sesion) {
    sesion = {
      rol: "admin",
      nombre: "Carlos Martínez",
      correo: "carlos.admin@managua.gob.ni",
      idUsuario: "AD-01"
    };
    store.guardarSesionWeb(sesion);
  }

  // Actualizar topbar
  const titleEl = document.getElementById("topbar-title");
  if (titleEl) {
    titleEl.textContent = pageTitle;
  }

  // Configurar role switcher
  const switcher = document.getElementById("role-switcher") as HTMLSelectElement | null;
  if (switcher) {
    switcher.value = sesion.rol;
    switcher.addEventListener("change", () => {
      if (!sesion) return;
      if (switcher.value === "operador") {
        sesion.rol = "operador";
        sesion.nombre = "Juan Pérez (OP-01)";
        sesion.idUsuario = "OP-01";
        sesion.vehiculo = "Camión 3T (Placa M-204)";
      } else {
        sesion.rol = "admin";
        sesion.nombre = "Carlos Martínez (AD-01)";
        sesion.idUsuario = "AD-01";
        delete sesion.vehiculo;
      }
      store.guardarSesionWeb(sesion);
      aplicarVisibilidadPorRol(sesion.rol);
      window.dispatchEvent(new CustomEvent("rol-changed", { detail: sesion }));
      // Si la página requiere admin y el rol es operador, redirigir al tablero
      const adminOnlyPages = ["destinos", "metricas", "exportacion", "usuarios"];
      if (sesion.rol === "operador" && adminOnlyPages.includes(pageId)) {
        window.location.href = "tablero.html";
      }
    });
  }

  // Marcar ítem activo en sidebar
  document.querySelectorAll<HTMLAnchorElement>(".sidebar-nav .sidebar-item").forEach((item) => {
    if (item.dataset.page === pageId) {
      item.classList.add("is-active");
      item.setAttribute("aria-current", "page");
    } else {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
    }
  });

  // Visibilidad por rol (RB-10)
  aplicarVisibilidadPorRol(sesion.rol);

  // Botón reset demo
  const btnReset = document.getElementById("btn-reset-demo");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("¿Reiniciar datos de demostración a su estado inicial?")) {
        store.reiniciarDemo();
        window.location.reload();
      }
    });
  }

  return sesion;
}

function aplicarVisibilidadPorRol(rol: string): void {
  const adminItems = document.querySelectorAll<HTMLElement>('[data-role="admin"]');
  adminItems.forEach((el) => {
    el.style.display = rol === "operador" ? "none" : "";
  });
}
