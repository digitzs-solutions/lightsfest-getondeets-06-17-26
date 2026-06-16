export default function DinoFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Escape from <span className="text-emerald-400">Dinosaur Island</span>
            </h3>
            <p className="text-slate-400">An unforgettable prehistoric adventure</p>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-sm">
              © 2026 Escape from Dinosaur Island. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Powered by Payvia • Secure payments via Tokenex
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
