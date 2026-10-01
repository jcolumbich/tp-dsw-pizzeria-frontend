import { test, expect } from '@playwright/test';

test('un usuario puede iniciar sesión con credenciales válidas', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email:').fill('admin@test.com');
  await page.getByLabel('Contraseña:').fill('admin123');

  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: /^Salir/ })).toBeVisible();
});
