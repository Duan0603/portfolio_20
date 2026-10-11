import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Walk from "@/components/Walk";

const Atelier = dynamic(() => import("@/components/Atelier"), { ssr: false });

export default function Home() {
  return (
    <>
      <Atelier />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Walk />
        </main>
      </div>
    </>
  );
}
