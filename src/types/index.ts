export interface Ingrediente {
  id: number;
  nombre: string;
  stock: number;
}

export interface Pizza {
  id: number;
  nombre: string;
  precio: number;
  vegetariana: boolean;
  disponible: boolean;
}

export interface Repartidor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: boolean;
  matricula: string;
  monto_propina_total: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  domicilio: string;
  estado: boolean;
}

export interface Pedido {
  id: number;
  dia: string;
  total: number;
  retiro: boolean;
  estado: string;
  cliente: number;
}



