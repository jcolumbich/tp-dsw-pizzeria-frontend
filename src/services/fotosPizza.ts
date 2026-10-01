const claveFoto = (id: number) => `due-paffutelli:foto-pizza:${id}`;

export function obtenerFotoPizza(id: number): string | null {
  try {
    return localStorage.getItem(claveFoto(id));
  } catch {
    return null;
  }
}

export function guardarFotoPizza(id: number, foto: string): void {
  localStorage.setItem(claveFoto(id), foto);
}

export function prepararFotoPizza(archivo: File): Promise<string> {
  if (!archivo.type.startsWith('image/')) {
    return Promise.reject(new Error('Seleccioná un archivo de imagen.'));
  }

  if (archivo.size > 5 * 1024 * 1024) {
    return Promise.reject(
      new Error('La imagen debe pesar menos de 5 MB.')
    );
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();

    imagen.onload = () => {
      const escala = Math.min(
        1,
        900 / imagen.width,
        600 / imagen.height
      );

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(imagen.width * escala);
      canvas.height = Math.round(imagen.height * escala);

      const contexto = canvas.getContext('2d');

      if (!contexto) {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo procesar la imagen.'));
        return;
      }

      contexto.fillStyle = '#fff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo abrir la imagen.'));
    };

    imagen.src = url;
  });
}