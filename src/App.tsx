import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Spinner from './components/Spinner'
import TarjetaProducto from './components/TarjetaProducto'
import { productos as productosMock } from './data/productos'
import type { Producto } from './types/producto'

function App() {
  // Estado (useState)
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [oscuro, setOscuro] = useState(false)
  const [carrito, setCarrito] = useState(0)

  // Ciclo de vida 1 (useEffect): simula petición asíncrona de 2 segundos
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setProductos(productosMock)
      setCargando(false)
    }, 2000)
    return () => clearTimeout(temporizador)
  }, [])

  // Ciclo de vida 2 (useEffect): sincroniza el tema con el <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
  }, [oscuro])

  // Ciclo de vida 3 (useEffect): actualiza el título de la pestaña
  useEffect(() => {
    document.title = `Dashboard (${carrito} en carrito)`
  }, [carrito])

  const categorias = [...new Set(productosMock.map((p) => p.categoria))]

  const filtrados = productos.filter(
    (p) =>
      (categoria === 'Todas' || p.categoria === categoria) &&
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <Navbar
        oscuro={oscuro}
        onCambiarTema={() => setOscuro((o) => !o)}
        totalCarrito={carrito}
      />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <Sidebar
            categorias={categorias}
            seleccionada={categoria}
            onSeleccionar={setCategoria}
          />
        </div>

        <section className="md:col-span-3">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
          />

          {cargando ? (
            <Spinner />
          ) : filtrados.length === 0 ? (
            <p className="py-10 text-center text-slate-500">
              No se encontraron productos.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((p) => (
                <TarjetaProducto
                  key={p.id}
                  producto={p}
                  onAgregar={() => setCarrito((c) => c + 1)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
