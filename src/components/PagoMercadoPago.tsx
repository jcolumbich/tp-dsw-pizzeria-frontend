import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { obtenerEstadoPago, verificarPago } from '../services/pagoService';
import type { EstadoPago } from '../services/pagoService';

const etiquetas: Record<string, string> = {
  sin_pagar: 'Esperando el pago. El pedido todavía no está confirmado.',
  aprobado: 'Pago aprobado',
  pendiente: 'Mercado Pago está procesando el pago. El pedido todavía no está confirmado.',
  rechazado: 'Pago rechazado. El pedido no está confirmado.',
  revision: 'El pago requiere revisión del local. No vuelvas a pagarlo.',
  efectivo: 'Pago en efectivo al recibir el pedido',
  anterior: 'Pedido anterior: medio de pago no registrado',
};

export default function PagoMercadoPago({ pedidoId, onEstadoPedido }: {
  pedidoId: number;
  onEstadoPedido?: (estado: string) => void;
}) {
  const { search } = useLocation();
  const parametros = new URLSearchParams(search);
  const retorno = parametros.get('payment_id') ?? parametros.get('collection_id');
  const paymentId = retorno && /^\d{1,30}$/.test(retorno) ? retorno : null;
  const [pago, setPago] = useState<EstadoPago | null>(null);
  const [error, setError] = useState('');
  const [demorado, setDemorado] = useState(false);
  const callback = useRef(onEstadoPedido);
  useEffect(() => { callback.current = onEstadoPedido; }, [onEstadoPedido]);

  useEffect(() => {
    let activo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let intentos = 0;
    let retornoConsultado = false;
    async function consultar() {
      let seguir = true;
      try {
        // La URL aporta un ID, nunca prueba que el pago esté aprobado.
        if (paymentId && !retornoConsultado) {
          try {
            await verificarPago(pedidoId, paymentId);
            retornoConsultado = true;
          } catch {
            // El webhook puede haber guardado el pago aunque falle el retorno.
            // Consultar la base y reintentar automáticamente si sigue pendiente.
          }
        }
        const data = await obtenerEstadoPago(pedidoId);
        if (!activo) return;
        setPago(data);
        setError('');
        callback.current?.(data.estadoPedido);
        seguir = data.estadoPedido === 'Esperando pago';
      } catch (err) {
        if (!activo) return;
        setError(err instanceof Error ? err.message : 'No se pudo comprobar el pago.');
      }
      intentos += 1;
      if (activo && seguir && intentos < 30) timer = setTimeout(() => { void consultar(); }, 10_000);
      else if (activo && seguir) setDemorado(true);
    }
    void consultar();
    return () => { activo = false; if (timer) clearTimeout(timer); };
  }, [pedidoId, paymentId]);

  return (
    <section className="panel" aria-label="Pago del pedido">
      <h2 className="titulo-seccion">Pago</h2>
      <p role="status">{pago?.estado === 'efectivo' ? (pago.retiro ? 'Pago en efectivo al retirar en el local' : etiquetas.efectivo) : pago ? etiquetas[pago.estado] ?? 'Estado de pago desconocido' : error ? 'No se pudo consultar el pago' : 'Comprobando el pago…'}</p>
      {pago?.estadoPedido === 'Cancelado' && <p>Pedido cancelado: no se preparará. Si hubo un cobro, el local debe revisarlo.</p>}
      {pago?.importe != null && <p>Importe: {pago.importe.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>}
      {error && <p role="alert">{error}</p>}
      {demorado && <p>La confirmación está demorada. Podés volver a Mis pedidos más tarde; no vuelvas a pagar.</p>}
    </section>
  );
}