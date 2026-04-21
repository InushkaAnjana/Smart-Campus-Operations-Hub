import { MdSchool } from 'react-icons/md'

const Footer = () => {
  return (
    <footer className="bg-transparent border-t border-white/10 pt-16 pb-8 text-slate-400 relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600/80 backdrop-blur-sm border border-indigo-400/30 text-white p-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                <MdSchool className="text-xl" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight drop-shadow-md">Smart Campus</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-slate-300 font-light">
              Enhancing campus life with intelligent tools for booking, maintenance, and resource management.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#home" className="hover:text-indigo-400 transition-colors inline-block hover:translate-x-1 duration-300">Home</a></li>
              <li><a href="#about" className="hover:text-indigo-400 transition-colors inline-block hover:translate-x-1 duration-300">About Us</a></li>
              <li><a href="#contact" className="hover:text-indigo-400 transition-colors inline-block hover:translate-x-1 duration-300">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors inline-block hover:translate-x-1 duration-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors inline-block hover:translate-x-1 duration-300">Terms of Service</a></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-white/10 text-center text-sm font-light">
          <p>&copy; {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
