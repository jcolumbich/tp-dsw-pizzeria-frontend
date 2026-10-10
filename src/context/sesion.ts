import type { UsuarioLogueado } from '../interfaces/auth';
export interface Sesion { token: string; usuario: UsuarioLogueado }
const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';
export function vencimientoToken(token: string): number | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    const payload = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch { return null; }
}
export function limpiarSesiones(): void {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USUARIO_KEY);
  }
}
export function guardarSesion(sesion: Sesion, recordar: boolean): void {
  limpiarSesiones();
  const storage = recordar ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, sesion.token);
  storage.setItem(USUARIO_KEY, JSON.stringify(sesion.usuario));
}
export function leerSesionGuardada(): Sesion | null {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem(TOKEN_KEY);
    const usuarioJson = storage.getItem(USUARIO_KEY);
    try {
      if (token && usuarioJson) {
        const vencimiento = vencimientoToken(token);
        const usuario = JSON.parse(usuarioJson) as UsuarioLogueado;
        if (vencimiento !== null && vencimiento > Date.now() && usuario && Number.isSafeInteger(usuario.id) && usuario.id > 0 &&
          (usuario.nivel_permisos === 0 || usuario.nivel_permisos === 1)) return { token, usuario };
      }
    } catch { /* Una sesión inválida no se restaura. */ }
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USUARIO_KEY);
  }
  return null;
}