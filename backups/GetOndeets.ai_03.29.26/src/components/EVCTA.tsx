import { ArrowRight, CheckCircle } from 'lucide-react';

export default function EVCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your Property?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join hundreds of property owners who are already providing world-class EV charging experiences.
              Get started with a free consultation today.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Free site assessment and consultation',
                'Flexible financing options available',
                'Professional installation included',
                'Comprehensive training and support'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-blue-50">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                Schedule Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-blue-700/50 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-blue-700 transition-all border border-blue-400/30">
                Download Brochure
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
            <h3 className="text-2xl font-bold mb-6">Get a Quick Quote</h3>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <select className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40 transition-colors">
                  <option value="" className="bg-blue-900">Property Type</option>
                  <option value="commercial" className="bg-blue-900">Commercial</option>
                  <option value="residential" className="bg-blue-900">Residential</option>
                  <option value="retail" className="bg-blue-900">Retail</option>
                  <option value="fleet" className="bg-blue-900">Fleet</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all shadow-xl"
              >
                Get Your Quote
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
