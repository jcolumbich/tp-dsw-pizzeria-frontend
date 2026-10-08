export function formatearPrecio(valor: number): string {
  return `$${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(valor)}`;
}
