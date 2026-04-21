import { Link } from 'react-router-dom'
import { MdArrowForward, MdDashboardCustomize } from 'react-icons/md'

const HeroSection = () => {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex items-center justify-center">
      
      {/* Background Image with Parallax-like fixed attachment */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat bg-fixed object-cover pointer-events-none"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" 
        }}
      />

      {/* Premium Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-slate-900/90 z-0"></div>

      {/* Abstract Glowing Orbs in the background */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto backdrop-blur-sm bg-white/5 border border-white/10 p-8 md:p-14 rounded-3xl shadow-2xl">
          
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 text-indigo-100 border border-white/20 text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(79,70,229,0.5)] backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400"></span>
            </span>
            <span className="tracking-wide uppercase text-xs">Welcome to the Future</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Smart Campus <br className="hidden md:block mt-2" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 animate-gradient-x">
              Operations Hub
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-light">
            Elevate your university experience. Manage bookings, secure resources, and track maintenance seamlessly through our master platform.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-5 w-full justify-center">
            <Link 
              to="/register" 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-1 transition-all duration-300 border border-indigo-500/50"
            >
              Get Started <MdArrowForward className="text-xl" />
            </Link>
            <Link 
              to="/login" 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg border border-white/20 hover:border-white/40 shadow-lg backdrop-blur-md hover:-translate-y-1 transition-all duration-300"
            >
              <MdDashboardCustomize className="text-xl" /> Enter Dashboard
            </Link>
          </div>

        </div>
      </div>
      
      {/* Bottom fade out to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none"></div>
    </section>
  )
}

export default HeroSection
