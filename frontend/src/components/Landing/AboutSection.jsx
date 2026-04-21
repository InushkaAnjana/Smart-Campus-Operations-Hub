import { MdEventAvailable, MdBuild, MdMeetingRoom } from 'react-icons/md'

const features = [
  {
    title: 'Resource Management',
    description: 'Instantly track, request, and manage high-value campus resources from technical equipment to laboratories.',
    icon: <MdBuild />,
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'hover:shadow-blue-500/20',
  },
  {
    title: 'Booking System',
    description: 'Ensure double-booking is a thing of the past. Reserve study rooms, auditoriums, and facilities effortlessly.',
    icon: <MdEventAvailable />,
    gradient: 'from-indigo-500 to-purple-500',
    shadow: 'hover:shadow-indigo-500/20',
  },
  {
    title: 'Maintenance Tracking',
    description: 'Report infrastructural issues and track maintenance tickets in real-time to keep your campus pristine.',
    icon: <MdMeetingRoom />,
    gradient: 'from-fuchsia-500 to-pink-500',
    shadow: 'hover:shadow-fuchsia-500/20',
  }
]

const AboutSection = () => {
  return (
    <section id="about" className="py-28 relative bg-slate-50 overflow-hidden">
      
      {/* Background Decals */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-100 rounded-full blur-[100px] opacity-70 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 fade-in">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold tracking-widest uppercase mb-4 shadow-sm border border-indigo-200">
            About The Ecosystem
          </div>
          <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Empowering Your Campus Journey</h3>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
            The Smart Campus Operations Hub is a centralized nerve center designed to streamline day-to-day operations. 
            Automated, intelligent, and beautifully crafted for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`group relative bg-white rounded-3xl p-10 border border-slate-200/60 shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 ${feature.shadow}`}
            >
              {/* Top gradient line effect */}
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${feature.gradient} rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white mb-8 bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Optional tiny learn more style arrow */}
              <div className="mt-8 flex items-center text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors duration-300">
                Explore Feature <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
