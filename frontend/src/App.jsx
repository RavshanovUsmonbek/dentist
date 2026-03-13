import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Services from './components/sections/Services';
import Gallery from './components/sections/Gallery';
import Testimonials from './components/sections/Testimonials';
import Contact from './components/sections/Contact';
import AdminApp from './admin/AdminApp';

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
          <Contact />
        </main>
        <Footer />
      </div>
    </SiteProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
