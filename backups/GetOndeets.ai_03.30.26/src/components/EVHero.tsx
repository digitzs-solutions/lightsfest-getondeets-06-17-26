import { ChevronRight, Zap } from 'lucide-react';

export default function EVHero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-700/50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Next-Gen EV Charging Solutions</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Power Your Future with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Smart EV Charging
              </span>
            </h1>

            <p className="text-xl text-blue-100 leading-relaxed">
              Transform your property with intelligent electric vehicle charging stations.
              Fast, reliable, and designed for tomorrow's transportation needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                Get Started
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-blue-700/50 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-blue-700 transition-all border border-blue-400/30">
                View Solutions
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-blue-700/50">
              <div>
                <div className="text-3xl font-bold text-cyan-300">500+</div>
                <div className="text-sm text-blue-200">Installations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-300">99.9%</div>
                <div className="text-sm text-blue-200">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-300">24/7</div>
                <div className="text-sm text-blue-200">Support</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-800/50 to-blue-900/50 backdrop-blur-sm p-8 rounded-3xl border border-blue-400/30 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-48 h-48 text-cyan-300" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
