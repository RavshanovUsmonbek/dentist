import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { SiteProvider } from './context/SiteContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Services from './components/sections/Services';
import Gallery from './components/sections/Gallery';
import Testimonials from './components/sections/Testimonials';
import Locations from './components/sections/Locations';
import Contact from './components/sections/Contact';
import AdminApp from './admin/AdminApp';
import './i18n/config'; // Initialize i18next

// Public website component
const PublicSite = () => {
  return (
    <SiteProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <About />
          <Services />
          <Gallery />
          <Testimonials />
          <Locations />
          <Contact />
        </main>
        <Footer />
      </div>
    </SiteProvider>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
