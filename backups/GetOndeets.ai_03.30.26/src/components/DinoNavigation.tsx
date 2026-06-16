import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function DinoNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-white">
              Escape from <span className="text-emerald-400">Dinosaur Island</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('tickets')}
              className="text-slate-300 hover:text-emerald-400 font-semibold transition-colors"
            >
              Tickets
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-slate-300 hover:text-emerald-400 font-semibold transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('scenes')}
              className="text-slate-300 hover:text-emerald-400 font-semibold transition-colors"
            >
              Scenes
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-slate-300 hover:text-emerald-400 font-semibold transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('tickets')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-emerald-500/50"
            >
              Get Tickets
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection('tickets')}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors font-semibold"
            >
              Tickets
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors font-semibold"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('scenes')}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors font-semibold"
            >
              Scenes
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors font-semibold"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('tickets')}
              className="block w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all"
            >
              Get Tickets
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
