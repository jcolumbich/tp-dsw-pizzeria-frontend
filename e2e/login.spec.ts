import { test, expect } from '@playwright/test';

test('un administrador inicia sesión y accede a su menú', async ({ page }) => {
  const usuario = {
    id: 1,
    nombre: 'Admin',
    apellido: 'Prueba',
    email: 'admin@example.com',
    nivel_permisos: 1,
  };

  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  );
  const token = `test.${payload}.test`;

  await page.route('**/api/auth/login', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      email: 'admin@example.com',
      contrasenia: 'clave-de-prueba',
    });

    await route.fulfill({
      status: 200,
      json: { data: { token, usuario } },
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email:').fill('admin@example.com');
  await page.getByLabel('Contraseña:').fill('clave-de-prueba');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: /^Salir/ })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Pizzas', exact: true }),
  ).toBeVisible();
});