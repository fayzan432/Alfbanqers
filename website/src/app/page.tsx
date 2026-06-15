import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Rates from '@/components/Rates';
import WhyChoose from '@/components/WhyChoose';
import Banks from '@/components/Banks';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Rates />
        <WhyChoose />
        <Banks />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
