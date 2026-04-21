import { useState } from 'react'
import { MdEmail, MdPerson, MdMessage, MdSend, MdPhone } from 'react-icons/md'

const ContactSection = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 1000)
  }

  return (
    <section id="contact" className="py-10 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row">
          
          {/* Left Info Panel */}
          <div className="flex-1 p-10 lg:p-16 bg-gradient-to-br from-indigo-950/80 via-slate-900/80 to-purple-950/80 text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-3 drop-shadow-md">Reach Out</h2>
                <h3 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">Let's start a conversation.</h3>
                <p className="text-indigo-200/80 text-lg font-light leading-relaxed mb-12">
                  Have questions about integrating your campus or need technical support? Drop us a message, and our dedicated team will be with you shortly.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl text-indigo-300 shadow-inner">
                    <MdEmail />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email Us</p>
                    <p className="font-semibold text-white tracking-wide">support@smartcampus.edu</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl text-indigo-300 shadow-inner">
                    <MdPhone />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Call Us</p>
                    <p className="font-semibold text-white tracking-wide">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="flex-1 p-10 lg:p-16 bg-slate-950/40">
            <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Send a Message</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative group">
                    <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-400 transition-colors" />
                    <input type="text" required placeholder="John Doe" className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 transition-all text-sm font-medium text-white placeholder-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative group">
                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-400 transition-colors" />
                    <input type="email" required placeholder="john@university.edu" className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 transition-all text-sm font-medium text-white placeholder-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                  <div className="relative group">
                    <MdMessage className="absolute left-4 top-5 text-slate-400 text-xl group-focus-within:text-indigo-400 transition-colors" />
                    <textarea required rows="4" placeholder="How can we help you?" className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 transition-all text-sm font-medium text-white placeholder-slate-500 resize-none"></textarea>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full mt-4 flex justify-center items-center gap-2 py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all duration-300 border border-white/10 ${
                  success ? 'bg-emerald-600/90 shadow-emerald-500/30' : 'bg-indigo-600/90 hover:bg-indigo-500 hover:-translate-y-1 shadow-indigo-500/30'
                }`}
              >
                {loading ? (
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                  'Message Sent Successfully!'
                ) : (
                  <><MdSend className="text-lg" /> Send Message</>
                )}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </section>
  )
}

export default ContactSection
