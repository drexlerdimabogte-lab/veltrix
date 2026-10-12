import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Capabilities from "@/components/Capabilities";
import Work from "@/components/Work";
import MoreWork from "@/components/MoreWork";
import Process from "@/components/Process";
import Lab from "@/components/Lab";
import Contact from "@/components/Contact";
import Reveals from "@/components/Reveals";
import Loader from "@/components/Loader";

export default function Home() {
  return (
    <SmoothScroll>
      <Loader />
      <div className="grain" aria-hidden />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Capabilities />
        <Work />
        <MoreWork />
        <Process />
        <Lab />
        <Contact />
      </main>
      <Reveals />
    </SmoothScroll>
  );
}
