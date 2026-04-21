import { MdEventAvailable, MdBuild, MdMeetingRoom } from 'react-icons/md'

const features = [
  {
    title: 'Resource Management',
    description: 'Instantly track, request, and manage high-value campus resources from technical equipment to laboratories.',
    icon: <MdBuild />,
    gradient: 'from-blue-500 to-cyan-400',
    shadow: 'hover:shadow-blue-500/20',
  },
  {
    title: 'Booking System',
    description: 'Ensure double-booking is a thing of the past. Reserve study rooms, auditoriums, and facilities effortlessly.',
    icon: <MdEventAvailable />,
    gradient: 'from-indigo-500 to-purple-400',
    shadow: 'hover:shadow-indigo-500/20',
  },
  {
    title: 'Maintenance Tracking',
    description: 'Report infrastructural issues and track maintenance tickets in real-time to keep your campus pristine.',
    icon: <MdMeetingRoom />,
    gradient: 'from-fuchsia-500 to-pink-400',
    shadow: 'hover:shadow-fuchsia-500/20',
  }
]

const AboutSection = () => {
  return (
    <section id="about" className="py-10 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-bold tracking-widest uppercase mb-4 shadow-sm backdrop-blur-md">
            About The Ecosystem
          </div>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">Empowering Your Campus Journey</h3>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light drop-shadow-sm">
            The Smart Campus Operations Hub is a centralized nerve center designed to streamline day-to-day operations. 
            Automated, intelligent, and beautifully crafted for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`group relative bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-slate-800/60 ${feature.shadow}`}
            >
              {/* Top gradient line effect */}
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${feature.gradient} rounded-t-[2rem] opacity-70 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white mb-8 bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h4 className="text-2xl font-bold text-white mb-4 drop-shadow-md">{feature.title}</h4>
              <p className="text-slate-300 leading-relaxed font-light">
                {feature.description}
              </p>
              
              {/* Optional tiny learn more style arrow */}
              <div className="mt-8 flex items-center text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors duration-300">
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
