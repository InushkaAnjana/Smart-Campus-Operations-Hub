import { Link } from 'react-router-dom'
import { MdArrowForward, MdDashboardCustomize } from 'react-icons/md'

const HeroSection = () => {
  return (
    <section id="home" className="relative pt-32 pb-10 md:pt-48 md:pb-20 flex items-center justify-center min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto backdrop-blur-xl bg-slate-950/30 border border-white/10 p-8 md:p-14 rounded-[2.5rem] shadow-2xl">
          
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 text-indigo-200 border border-white/10 text-sm font-semibold mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(79,70,229,0.15)] hover:bg-white/10 transition-colors cursor-default">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="tracking-wide uppercase text-xs tracking-[0.1em]">Welcome to the Future</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-xl">
            Smart Campus <br className="hidden md:block mt-2" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Operations Hub
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-light drop-shadow-md">
            Elevate your university experience. Manage bookings, secure resources, and track maintenance seamlessly through our master platform.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-5 w-full justify-center">
            <Link 
              to="/register" 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:shadow-[0_0_40px_rgba(79,70,229,0.7)] hover:-translate-y-1 transition-all duration-300 border border-indigo-400/30"
            >
              Get Started <MdArrowForward className="text-xl" />
            </Link>
            <Link 
              to="/login" 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-slate-900/50 hover:bg-slate-800 text-white font-bold text-lg border border-white/20 hover:border-white/40 shadow-lg backdrop-blur-xl hover:-translate-y-1 transition-all duration-300"
            >
              <MdDashboardCustomize className="text-xl" /> Enter Dashboard
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default HeroSection
