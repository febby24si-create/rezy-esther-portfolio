import { Outlet, Link } from 'react-router-dom'
import logo from '../assets/logo2.png'

export default function AuthLayout() {
  return (
    <div
      className="
        min-h-screen flex items-center
        justify-center relative overflow-hidden
      "
      style={{
        background:
          'linear-gradient(135deg, #020f09 0%, #041C15 50%, #06281F 100%)'
      }}
    >

      {/* BACKGROUND FX */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div
          className="
            absolute -top-40 -right-40
            w-96 h-96 rounded-full opacity-10
          "
          style={{
            background:
              'radial-gradient(circle, #22C55E, transparent)'
          }}
        />

        <div
          className="
            absolute -bottom-40 -left-40
            w-96 h-96 rounded-full opacity-10
          "
          style={{
            background:
              'radial-gradient(circle, #16A34A, transparent)'
          }}
        />

        <div
          className="
            absolute top-1/2 left-1/2
            transform -translate-x-1/2 -translate-y-1/2
            w-[800px] h-[800px] opacity-5
          "
          style={{
            background:
              'radial-gradient(circle, #22C55E, transparent)'
          }}
        />

        {/* GRID */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md px-4">

        {/* HEADER */}
        <div className="text-center mb-8">

          <Link
            to="/"
            className="
              inline-flex flex-col
              items-center gap-3
            "
          >

            {/* LOGO */}
            <div
              className="
                w-20 h-20 rounded-3xl
                overflow-hidden
                neon-border
                shadow-2xl
                border border-green-500/20
              "
              style={{
                background:
                  'linear-gradient(135deg, #0B3B2E, #06281F)'
              }}
            >
              <img
                src={logo}
                alt="EstherGarage Logo"
                className="
                  w-full h-full
                  object-cover
                "
              />
            </div>

            {/* TEXT */}
            <div>
              <p
                className="
                  text-2xl font-display
                  font-bold text-white
                  tracking-widest
                "
              >
                ESTHER
                <span className="text-green-400">
                  GARAGE
                </span>
              </p>

              <p
                className="
                  text-xs text-gray-500
                  tracking-[0.3em]
                  uppercase mt-1
                "
              >
                Bengkel Terpercaya
              </p>
            </div>
          </Link>
        </div>

        {/* FORM */}
        <Outlet />
      </div>
    </div>
  )
}