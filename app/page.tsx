import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Atelier = dynamic(() => import("@/components/Atelier"), { ssr: false });

export default function Home() {
  return (
    <>
      <Atelier />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Projects />
          <About />
          <Skills />
          <Contact />
          <Footer />
        </main>
      </div>
    </>
  );
}
