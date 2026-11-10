import type { Producto } from '../types/producto'

export const productos: Producto[] = [
  { id: 1, nombre: 'Laptop Pro 14"', categoria: 'Computo', precio: 24999, descripcion: 'Procesador de última generación y 16 GB de RAM.', imagen: '💻' },
  { id: 2, nombre: 'Audífonos Bluetooth', categoria: 'Audio', precio: 1299, descripcion: 'Cancelación de ruido y 30 horas de batería.', imagen: '🎧' },
  { id: 3, nombre: 'Smartphone X', categoria: 'Celulares', precio: 12999, descripcion: 'Pantalla AMOLED de 6.5" y cámara de 108 MP.', imagen: '📱' },
  { id: 4, nombre: 'Teclado Mecánico', categoria: 'Computo', precio: 1799, descripcion: 'Switches rojos con iluminación RGB.', imagen: '⌨️' },
  { id: 5, nombre: 'Bocina Portátil', categoria: 'Audio', precio: 899, descripcion: 'Resistente al agua con sonido de 360°.', imagen: '🔊' },
  { id: 6, nombre: 'Smartwatch Fit', categoria: 'Celulares', precio: 3499, descripcion: 'Monitor de ritmo cardiaco y GPS integrado.', imagen: '⌚' },
  { id: 7, nombre: 'Monitor 27" 4K', categoria: 'Computo', precio: 7899, descripcion: 'Panel IPS con 144 Hz y HDR.', imagen: '🖥️' },
  { id: 8, nombre: 'Micrófono USB', categoria: 'Audio', precio: 1599, descripcion: 'Ideal para streaming y podcasts.', imagen: '🎙️' },
]
