import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MdSchool, MdMenu, MdClose } from 'react-icons/md'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Contact Us', href: '#contact' }
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
        ? 'bg-slate-950/70 backdrop-blur-md shadow-lg border-b border-white/10 py-3' 
        : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/80 backdrop-blur-sm border border-indigo-400/30 text-white p-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <MdSchool className="text-2xl" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">
            Smart Campus
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map(link => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 ml-6 border-l border-white/10 pl-6">
            <Link 
              to="/login" 
              className="text-sm font-bold px-4 py-2 rounded-full text-white hover:bg-white/10 transition-all"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-bold px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 transition-all border border-indigo-400/50"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-2xl text-white bg-white/10 border border-white/20 p-2 rounded-xl backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl px-6 py-6 flex flex-col gap-5">
          <ul className="flex flex-col gap-5">
            {navLinks.map(link => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="block text-slate-300 text-lg font-medium hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <hr className="border-white/10 my-2" />
          <div className="flex flex-col gap-4">
            <Link 
              to="/login" 
              className="w-full text-center text-white font-bold py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="w-full text-center text-white bg-indigo-600 font-bold py-3 rounded-xl shadow-lg border border-indigo-400/50 hover:bg-indigo-500 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
