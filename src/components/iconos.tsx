import type { SVGProps } from 'react';

type IconoProps = SVGProps<SVGSVGElement>;

export function IconoMas({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoMenos({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconoX({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconoChevronArriba({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

export function IconoHoja({ className = 'icono icono--s', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 13M5 19l7-7" />
    </svg>
  );
}

export function IconoAlerta({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </svg>
  );
}

export function IconoCheck({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconoVolver({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconoFlechaDerecha({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconoCancelado({ className = 'icono', ...props }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}
