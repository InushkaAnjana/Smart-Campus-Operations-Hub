import Navbar from '../../components/Landing/Navbar'
import HeroSection from '../../components/Landing/HeroSection'
import AboutSection from '../../components/Landing/AboutSection'
import ContactSection from '../../components/Landing/ContactSection'
import Footer from '../../components/Landing/Footer'

const LandingPage = () => {
  return (
    <div className="font-sans smooth-scroll">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
