import { test, expect } from '@playwright/test';

test('un usuario puede iniciar sesión con credenciales válidas', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email:').fill('j@gmail.com');
  await page.getByLabel('Contraseña:').fill('1');

  const respuestaPendiente = page.waitForResponse(
    (respuesta) => respuesta.url().includes('/auth/login') && respuesta.request().method() === 'POST'
  );

  await page.getByRole('button', { name: 'Ingresar' }).click();
  const respuesta = await respuestaPendiente;

  expect(respuesta.status(), 'El login debe responder HTTP 200').toBe(200);
  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: /^Salir/ })).toBeVisible();
});