export interface FiltrosListado {
  pagina?: number;
  limite?: number;
  busqueda?: string;
}
export interface FiltrosPersona extends FiltrosListado { estado?: boolean }
export interface FiltrosPizza extends FiltrosListado { vegetariana?: boolean; disponible?: boolean }
export interface FiltrosPedido {
  pagina?: number;
  limite?: number;
  estado?: string;
  activos?: boolean;
  repartidorId?: number;
}
export interface Paginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}
export interface Pagina<T> { data: T[]; paginacion: Paginacion }
