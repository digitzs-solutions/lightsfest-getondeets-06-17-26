import { Sparkles } from 'lucide-react';

interface HeroProps {
  onGetTickets: () => void;
}

export default function Hero({ onGetTickets }: HeroProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDBBkwj1rOCtOESZ4ufGq-2MD8E57ClTQu_HXP9-L-sOZkIwj-uuCXq1HyzfgVUw-q71PF5L7gFfF7RvCZRppVlMivgxvYcQD6J2ir7D8TxN3EwS-uUzQartr7j-ccmJANv-sB6GAgV7q2JgBYcrtRvAyaoaiolDf056y7Jn2A15n7_mAnUjooU9vwAArARjHee9DYb-9T8iMzam1GdGFZhgkQx3GXdtEnnXHc1effGnbo2RzUJ3SrS1YVRE70cGF2abLkRzu9bGMw)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
          <Sparkles className="w-4 h-4 text-[#cd2bee]" />
          <span className="text-sm font-medium text-white">Experience the Magic</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
          IGNITE THE
          <br />
          <span className="text-[#cd2bee] drop-shadow-glow">NIGHT</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of dreamers as we light up the sky together.
          <br />
          An unforgettable experience of light, music, and connection.
        </p>

        <button
          onClick={onGetTickets}
          className="px-10 py-4 bg-[#cd2bee] text-white text-lg font-bold rounded-full hover:bg-[#a61cbd] transition-all duration-300 shadow-glow hover:shadow-[0_0_30px_rgba(205,43,238,0.5)] hover:scale-105"
        >
          Get Your Tickets
        </button>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/80">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">50K+</div>
            <div className="text-sm">Festival Goers</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">25+</div>
            <div className="text-sm">Cities Worldwide</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-sm">Pure Magic</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8f6f8] to-transparent" />
    </section>
  );
}
