import { test, expect } from '@playwright/test';

test('clientes: pide páginas al backend, busca fuera de la primera página y permite limpiar sin coincidencias', async ({ page }) => {
  const usuario = { id: 1, nombre: 'Admin', email: 'admin@example.com', nivel_permisos: 1 };
  await page.addInitScript(({ usuario }) => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    sessionStorage.setItem('auth_token', `test.${payload}.test`);
    sessionStorage.setItem('auth_usuario', JSON.stringify(usuario));
  }, { usuario });
  const consultas: URLSearchParams[] = [];
  await page.route('**/api/clientes?*', async route => {
    const query = new URL(route.request().url()).searchParams;
    consultas.push(query);
    const pagina = Number(query.get('pagina'));
    const busqueda = query.get('busqueda');
    const persona = { id: 42, nombre: 'José', apellido: 'Pérez', domicilio: 'Córdoba 123', estado: true };
    let data: unknown[] = [{ ...persona, id: 1, nombre: 'Ana' }];
    let total = 11;
    if (pagina === 2 || busqueda === 'jose') data = [persona];
    if (busqueda === 'jose') total = 1;
    if (busqueda === 'inexistente') { data = []; total = 0; }
    await route.fulfill({ json: { data, paginacion: { pagina, limite: 10, total, totalPaginas: Math.max(1, Math.ceil(total / 10)) } } });
  });
  await page.goto('/clientes');
  await expect(page.getByRole('cell', { name: 'Ana', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'José', exact: true })).toBeVisible();
  expect(consultas.at(-1)?.get('pagina')).toBe('2');
  await page.getByLabel('Buscar clientes', { exact: true }).fill('jose');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByText('Página 1 de 1')).toBeVisible();
  expect(consultas.at(-1)?.get('busqueda')).toBe('jose');
  expect(consultas.at(-1)?.get('pagina')).toBe('1');
  await page.getByLabel('Buscar clientes', { exact: true }).fill('inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByText(/No hay coincidencias/)).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Ana', exact: true })).toBeVisible();
});

test('mis pedidos: distingue Esperando pago de Pendiente y conserva filtros sin resultados', async ({ page }) => {
  const usuario = { id: 1, nombre: 'Cliente', email: 'cliente@example.com', nivel_permisos: 0 };
  await page.addInitScript(({ usuario }) => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    sessionStorage.setItem('auth_token', `test.${payload}.test`);
    sessionStorage.setItem('auth_usuario', JSON.stringify(usuario));
  }, { usuario });
  let estado: string | null = null;
  await page.route('**/api/pedidos?*', async route => {
    const query = new URL(route.request().url()).searchParams;
    estado = query.get('estado');
    await route.fulfill({ json: { data: [], paginacion: { pagina: 1, limite: 10, total: 0, totalPaginas: 1 } } });
  });
  await page.goto('/mis-pedidos');
  await page.getByText('Esperando pago', { exact: true }).click();
  await expect(page.getByText('No tenés pedidos en ese estado')).toBeVisible();
  expect(estado).toBe('Esperando pago');
  await page.getByText('Pendiente', { exact: true }).click();
  await expect.poll(() => estado).toBe('Pendiente');
  await page.getByRole('button', { name: 'Ver todos', exact: true }).click();
  await expect.poll(() => estado).toBeNull();
});
