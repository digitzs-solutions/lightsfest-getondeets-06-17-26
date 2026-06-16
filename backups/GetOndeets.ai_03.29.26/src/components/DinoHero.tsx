import { ChevronDown } from 'lucide-react';

export default function DinoHero() {
  const scrollToTickets = () => {
    const element = document.getElementById('tickets');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/19670495/pexels-photo-19670495.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
        <div className="space-y-8">
          <div className="inline-block animate-fade-in">
            <img
              src="https://images.pexels.com/photos/4426470/pexels-photo-4426470.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Dinosaur"
              className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full border-8 border-emerald-500/30 shadow-2xl mx-auto"
            />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight animate-slide-up">
            coming to <span className="text-emerald-400">Tampa</span>
          </h1>

          <button
            onClick={scrollToTickets}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105"
          >
            Get your tickets
            <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
          </button>

          <p className="text-2xl md:text-3xl text-emerald-300 font-semibold tracking-wide animate-slide-up-delay">
            An interactive thrill walkthrough
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
}
