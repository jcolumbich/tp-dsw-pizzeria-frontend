let tokenActual: string | null = null;

export function setAuthToken(token: string | null): void {
  tokenActual = token;
}

export function getAuthHeaders(): HeadersInit {
  return tokenActual
    ? { Authorization: `Bearer ${tokenActual}` }
    : {};
}