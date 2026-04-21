import Navbar from '../../components/Landing/Navbar'
import HeroSection from '../../components/Landing/HeroSection'
import AboutSection from '../../components/Landing/AboutSection'
import ContactSection from '../../components/Landing/ContactSection'
import Footer from '../../components/Landing/Footer'

const LandingPage = () => {
  return (
    <div className="font-sans relative min-h-screen text-slate-100 selection:bg-indigo-500/30">
      
      {/* Global Fixed Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none -z-20"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" 
        }}
      />

      {/* Global Premium Overlay Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/85 to-zinc-950/95 -z-10 pointer-events-none"></div>

      {/* Global Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col">
        <Navbar />
        <main className="flex flex-col gap-20 md:gap-32 pb-24">
          <HeroSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </div>

    </div>
  )
}

export default LandingPage
