import { useState } from 'react'
import { MdEmail, MdPerson, MdMessage, MdSend, MdLocationOn, MdPhone } from 'react-icons/md'

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
    <section id="contact" className="py-28 bg-white relative overflow-hidden">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          
          {/* Left Info Panel */}
          <div className="flex-1 p-10 lg:p-16 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-3">Reach Out</h2>
                <h3 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">Let's start a conversation.</h3>
                <p className="text-indigo-100 text-lg font-light leading-relaxed mb-12">
                  Have questions about integrating your campus or need technical support? Drop us a message, and our dedicated team will be with you shortly.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl text-indigo-300">
                    <MdEmail />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email Us</p>
                    <p className="font-semibold">support@smartcampus.edu</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl text-indigo-300">
                    <MdPhone />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Call Us</p>
                    <p className="font-semibold">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="flex-1 p-10 lg:p-16 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Send a Message</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative group">
                    <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors" />
                    <input type="text" required placeholder="John Doe" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative group">
                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors" />
                    <input type="email" required placeholder="john@university.edu" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                  <div className="relative group">
                    <MdMessage className="absolute left-4 top-5 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors" />
                    <textarea required rows="4" placeholder="How can we help you?" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium resize-none"></textarea>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full mt-4 flex justify-center items-center gap-2 py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all duration-300 ${
                  success ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-indigo-700'
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
