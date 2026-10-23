import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  crearCheckout,
  obtenerEstadoPago,
  verificarPago,
} from '../services/pagoService';
import type { EstadoPago } from '../services/pagoService';

const etiquetas: Record<string, string> = {
  sin_pagar: 'Sin pago registrado',
  aprobado: 'Pago aprobado',
  pendiente: 'Pago en procesamiento',
  rechazado: 'Pago rechazado',
  revision: 'El pago requiere revisión',
};

export default function PagoMercadoPago({
  pedidoId,
}: {
  pedidoId: number;
}) {
  const { search } = useLocation();

  const parametros = new URLSearchParams(search);
  const retornoId =
    parametros.get('payment_id') ??
    parametros.get('collection_id');

  // Temporal: recuperar la operación existente del pedido #33.
  // Este identificador solo se consulta; no se realiza otro pago.
  const paymentId =
    retornoId && /^\d{1,30}$/.test(retornoId)
      ? retornoId
      : Number(pedidoId) === 33
        ? '185695602666'
        : null;

  const [pago, setPago] = useState<EstadoPago | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);

  const bloqueo = useRef(false);

  useEffect(() => {
    let activo = true;

    setPago(null);
    setError('');
    setCargando(true);

    async function cargar() {
      try {
        const data = paymentId
          ? await verificarPago(pedidoId, paymentId)
          : await obtenerEstadoPago(pedidoId);

        if (activo) {
          setPago(data);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo consultar el pago.',
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargar();

    return () => {
      activo = false;
    };
  }, [pedidoId, paymentId]);

  async function actualizar() {
    if (bloqueo.current || cargando) return;

    bloqueo.current = true;
    setOcupado(true);
    setError('');
    setPago(null);

    try {
      const data = paymentId
        ? await verificarPago(pedidoId, paymentId)
        : await obtenerEstadoPago(pedidoId);

      setPago(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo verificar el pago.',
      );
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }

  async function pagar() {
    if (
      bloqueo.current ||
      cargando ||
      paymentId ||
      error ||
      !pago?.puedePagar
    ) {
      return;
    }

    bloqueo.current = true;
    setOcupado(true);
    setError('');

    try {
      const { url } = await crearCheckout(pedidoId);
      window.location.assign(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo abrir Mercado Pago.',
      );

      bloqueo.current = false;
      setOcupado(false);
    }
  }

  const trabajando = cargando || ocupado;

  const mostrarBotonPagar =
    !trabajando &&
    !error &&
    !paymentId &&
    pago?.puedePagar === true;

  return (
    <section className="panel" aria-label="Pago del pedido">
      <h2 className="titulo-seccion">Pago de prueba</h2>

      <p role="status">
        {trabajando
          ? 'Consultando pago…'
          : error
            ? 'No se pudo verificar el pago'
            : pago
              ? etiquetas[pago.estado] ?? 'Estado desconocido'
              : 'Sin información del pago'}
      </p>

      {pago?.importe != null && (
        <p>
          Importe:{' '}
          {Number(pago.importe).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          })}
        </p>
      )}

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {paymentId && pago?.estado !== 'aprobado' && (
        <p>
          Estamos verificando una operación existente.
          No vuelvas a pagar este pedido.
        </p>
      )}

      {mostrarBotonPagar && (
        <button
          type="button"
          className="btn btn--primario"
          onClick={() => void pagar()}
        >
          Pagar con Mercado Pago
        </button>
      )}

      <button
        type="button"
        className="btn btn--secundario"
        disabled={trabajando}
        onClick={() => void actualizar()}
      >
        {trabajando
          ? 'Consultando…'
          : 'Actualizar estado del pago'}
      </button>

      <p>
        Usá el comprador y las tarjetas de prueba de Mercado Pago.
      </p>
    </section>
  );
}