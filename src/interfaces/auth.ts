export interface UsuarioLogueado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  nivel_permisos: number;
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioLogueado;
}