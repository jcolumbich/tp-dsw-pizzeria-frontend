# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> un usuario puede iniciar sesión con credenciales válidas
- Location: e2e\login.spec.ts:3:1

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/login$/
Received string: "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/login"

```

```yaml
- navigation:
  - link "Due Paffutelli - Inicio":
    - /url: /
    - img "Due Paffutelli"
  - link "Inicio":
    - /url: /
  - link "Carta":
    - /url: /#carta
  - link "Iniciar sesión":
    - /url: /login
- main:
  - paragraph: Bienvenido de nuevo
  - heading "Tu pizza te está esperando." [level=1]
  - paragraph: Ingresá para repetir tus pizzas favoritas y seguir el estado de tus pedidos.
  - heading " Iniciar sesión" [level=2]
  - paragraph:
    - text: ¿Primera vez?
    - link "Creá tu cuenta":
      - /url: /registro
  - alert:  Credenciales inválidas
  - text: "Email:"
  - textbox "Email:": admin@test.com
  - text: "Contraseña:"
  - textbox "Contraseña:": admin123
  - checkbox "Recordarme en este dispositivo"
  - text: Recordarme en este dispositivo
  - button "Ingresar"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('un usuario puede iniciar sesión con credenciales válidas', async ({ page }) => {
  4  |   await page.goto('/login');
  5  | 
  6  |   await page.getByLabel('Email:').fill('j@gmail.com');
  7  |   await page.getByLabel('Contraseña:').fill('1');
  8  | 
  9  |   await page.getByRole('button', { name: 'Ingresar' }).click();
  10 | 
> 11 |   await expect(page).not.toHaveURL(/\/login$/);
     |                          ^ Error: expect(page).not.toHaveURL(expected) failed
  12 |   await expect(page.getByRole('button', { name: /^Salir/ })).toBeVisible();
  13 | });
  14 | 
```