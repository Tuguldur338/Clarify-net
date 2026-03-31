import Intro from "@/components/intro";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-100">
      <section className="relative h-[60vh] md:h-[65vh] overflow-hidden">
        <video
          src="/images/knowledge_vid.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="relative z-10 flex items-center justify-center h-full px-4"></div>
      </section>

      <div className="bg-white border-t border-slate-200">
        <Intro />
      </div>
    </main>
  );
}
