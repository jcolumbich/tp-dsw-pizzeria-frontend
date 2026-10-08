const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatearFechaPedido(iso: string): string {
  const fecha = new Date(iso);
  const dia = fecha.getDate();
  const mes = MESES[fecha.getMonth()];
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${dia} ${mes} ${anio} · ${horas}:${minutos}`;
}

export interface OpcionEstado {
  valor: string;
  etiqueta: string;
  clase: string;
}

export const ESTADOS_FILTRO: OpcionEstado[] = [
  { valor: 'Pendiente', etiqueta: 'Pendiente', clase: 'pendiente' },
  { valor: 'En preparación', etiqueta: 'En preparación', clase: 'en-preparacion' },
  { valor: 'En camino', etiqueta: 'En camino', clase: 'en-camino' },
  { valor: 'Entregado', etiqueta: 'Entregado', clase: 'entregado' },
  { valor: 'Cancelado', etiqueta: 'Cancelado', clase: 'cancelado' },
];

export function claseEstado(estado: string): string {
  return ESTADOS_FILTRO.find((opcion) => opcion.valor === estado)?.clase ?? 'pendiente';
}

export function pasosSeguimiento(retiro: boolean): string[] {
  return retiro
    ? ['Pendiente', 'En preparación', 'Entregado']
    : ['Pendiente', 'En preparación', 'En camino', 'Entregado'];
}

export function notaSeguimiento(estado: string, retiro: boolean): string {
  if (retiro) {
    if (estado === 'Pendiente') return 'Todavía no empezamos a prepararlo.';
    if (estado === 'En preparación') return 'Lo estamos preparando. Lo retirás en el local.';
    if (estado === 'Entregado') return 'Lo retiraste en el local.';
  } else {
    if (estado === 'Pendiente') return 'Todavía no empezamos a prepararlo.';
    if (estado === 'En preparación') return 'Lo estamos preparando. Te lo enviamos cuando esté listo.';
    if (estado === 'En camino') return 'Va en camino al domicilio registrado en tu cuenta.';
    if (estado === 'Entregado') return 'Fue entregado en el domicilio registrado en tu cuenta.';
  }
  return '';
}
