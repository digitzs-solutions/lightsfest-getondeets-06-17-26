import { ChevronRight, Shield } from 'lucide-react';

export default function Hero() {
  const scrollToSolutions = () => {
    const element = document.getElementById('solutions');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJ3aGl0ZSIvPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/30 mb-8">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">PCI DSS 4.0 Compliant • Block 90% of Chargebacks</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Stop Chargebacks Before
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              They Happen
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-200 mb-12 leading-relaxed max-w-3xl mx-auto">
            Processor-agnostic fraud prevention and dispute management that cuts chargeback ratios by 50%.
            Keep 100% of your revenue with automated alerts and submission.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={scrollToSolutions}
              className="group px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 flex items-center gap-2"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all">
              See How It Works
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/20">
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-emerald-400">90%</div>
              <div className="text-slate-300">Chargebacks Blocked</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-emerald-400">50%</div>
              <div className="text-slate-300">CBR Reduction</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-emerald-400">24/7</div>
              <div className="text-slate-300">Auto Management</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-emerald-400">$0</div>
              <div className="text-slate-300">Integration Cost</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
