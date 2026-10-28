import { test, expect } from '@playwright/test';

// Navegador real; API y proveedor simulados. No usa cuentas ni realiza pagos.
for (const retiro of [false, true]) {
  for (const medio of ['efectivo', 'mercadopago']) {
    test(
      `checkout ${retiro ? 'retiro' : 'delivery'} / ${medio}`,
      async ({ page }) => {
        const usuario = {
          id: 1,
          nombre: 'Cliente',
          email: 'cliente@example.com',
          nivel_permisos: 0,
        };

        await page.addInitScript(({ usuario }) => {
          const payload = btoa(
            JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
          );
          sessionStorage.setItem('auth_token', `test.${payload}.test`);
          sessionStorage.setItem('auth_usuario', JSON.stringify(usuario));
        }, { usuario });

        const pizza = {
          id: 1,
          nombre: 'Muzzarella',
          precio: 1000,
          disponible: true,
          vegetariana: true,
        };

        const pedido = {
          id: 8,
          dia: new Date().toISOString(),
          retiro,
          total: 1000,
          monto_propina: 0,
          costo_envio: retiro ? 0 : 200,
          medio_pago: medio,
          estado: medio === 'efectivo' ? 'Pendiente' : 'Esperando pago',
          detalles: [{ pizza, cantidad: 1, precio_unitario: 1000 }],
          checkoutUrl:
            medio === 'mercadopago'
              ? 'https://www.mercadopago.com.ar/checkout/test-frontend'
              : undefined,
        };

        let enviado: Record<string, unknown> | undefined;

        await page.route('**/api/**', async (route) => {
          const url = new URL(route.request().url());
          let data: unknown;

          if (url.pathname === '/api/pizzas') {
            data = [pizza];
          } else if (url.pathname === '/api/pedidos/tarifa-envio') {
            data = { costo: 200 };
          } else if (
            url.pathname === '/api/pedidos' &&
            route.request().method() === 'POST'
          ) {
            enviado = route.request().postDataJSON();
            data = pedido;
          } else if (url.pathname.startsWith('/api/pagos/')) {
            data = {
              estado: 'efectivo',
              estadoPedido: 'Pendiente',
              medioPago: 'efectivo',
              retiro,
              puedePagar: false,
              importe: null,
            };
          } else {
            data = pedido;
          }

          await route.fulfill({
            json: {
              data,
              ...(url.pathname === '/api/pizzas'
                ? {
                    paginacion: {
                      pagina: 1,
                      limite: 12,
                      total: 1,
                      totalPaginas: 1,
                    },
                  }
                : {}),
            },
          });
        });

        await page.route(
          'https://www.mercadopago.com.ar/checkout/test-frontend',
          (route) =>
            route.fulfill({
              contentType: 'text/html',
              body: '<h1>Checkout simulado</h1>',
            }),
        );

        await page.goto('/pedidos/nuevo');
        await page
          .getByRole('button', { name: 'Agregar Muzzarella al pedido' })
          .click();

        if (retiro) {
          await page.getByText('Retiro en el local', { exact: true }).click();
        }

        if (medio === 'mercadopago') {
          await page
            .getByText('Tarjeta / Mercado Pago', { exact: true })
            .click();
        }

        await page
          .getByRole('button', {
            name:
              medio === 'efectivo'
                ? /Confirmar pedido en efectivo/
                : /Ir a pagar con Mercado Pago/,
          })
          .click();

        if (medio === 'efectivo') {
          await expect(
            page.getByRole('heading', {
              name: '¡Listo! Ya tenemos tu pedido',
            }),
          ).toBeVisible();

          await expect(
            page.getByText(
              retiro
                ? 'Pago en efectivo al retirar en el local'
                : 'Pago en efectivo al recibir el pedido',
            ),
          ).toBeVisible();

          await expect(
            page.getByRole('button', {
              name: /Pagar con Mercado Pago|Actualizar estado del pago/,
            }),
          ).toHaveCount(0);
        } else {
          await expect(
            page.getByRole('heading', { name: 'Checkout simulado' }),
          ).toBeVisible();
        }

        expect(enviado).toMatchObject({
          retiro,
          medio_pago: medio,
          costo_envio: retiro ? 0 : 200,
        });
        expect(enviado?.checkout_id).toMatch(/^[a-f0-9-]{36}$/);
      },
    );
  }
}