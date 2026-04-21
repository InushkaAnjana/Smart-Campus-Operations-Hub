import { MdSchool } from 'react-icons/md'

const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <MdSchool className="text-xl" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Smart Campus</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Enhancing campus life with intelligent tools for booking, maintenance, and resource management.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#home" className="hover:text-indigo-400 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
