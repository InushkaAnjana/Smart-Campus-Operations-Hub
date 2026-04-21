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
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <MdSchool className="text-2xl" />
          </div>
          <span className={`font-bold text-xl tracking-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}>
            Smart Campus
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map(link => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className={`text-sm font-medium hover:text-indigo-500 transition-colors ${
                    isScrolled ? 'text-slate-600' : 'text-white/90'
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 ml-2">
            <Link 
              to="/login" 
              className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${
                isScrolled 
                  ? 'text-slate-700 hover:bg-slate-100' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-bold px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-2xl text-slate-800 bg-white/50 p-2 rounded-lg backdrop-blur"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl px-6 py-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map(link => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="block text-slate-700 font-medium hover:text-indigo-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <hr className="border-slate-100" />
          <div className="flex flex-col gap-3 pb-2">
            <Link 
              to="/login" 
              className="w-full text-center text-slate-700 font-bold py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="w-full text-center text-white bg-indigo-600 font-bold py-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
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
