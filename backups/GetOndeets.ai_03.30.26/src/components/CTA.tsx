import { ArrowRight, CheckCircle, Zap } from 'lucide-react';

export default function CTA() {
  return (
    <>
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJ3aGl0ZSIvPjwvZz48L3N2Zz4=')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Limited Time Offer</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Power Your Property's Future?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join thousands of satisfied property owners who have already transformed their properties with DigitZS. Get started today with a free consultation and site assessment.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  'Free on-site consultation and energy assessment',
                  'Custom solution design tailored to your needs',
                  'Maximize available incentives and rebates',
                  'Professional installation and training included',
                  'Ongoing support and maintenance',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-blue-50">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-blue-500/20 hover:scale-105 flex items-center justify-center gap-2">
                  Get Your Free Quote
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all">
                  Schedule Consultation
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <h3 className="text-2xl font-bold mb-6">Request a Quote</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
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
                    <option value="commercial" className="bg-blue-900">Commercial Real Estate</option>
                    <option value="residential" className="bg-blue-900">Residential Community</option>
                    <option value="retail" className="bg-blue-900">Retail & Hospitality</option>
                    <option value="fleet" className="bg-blue-900">Fleet Operations</option>
                    <option value="other" className="bg-blue-900">Other</option>
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Tell us about your project (optional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all shadow-xl"
                >
                  Get Your Free Quote
                </button>
                <p className="text-xs text-blue-200 text-center">
                  By submitting, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-3xl font-bold mb-2">Start Charging Smarter Today</h3>
              <p className="text-xl text-blue-100">
                Transform your property with intelligent EV infrastructure
              </p>
            </div>
            <button className="group px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 flex items-center gap-2 whitespace-nowrap">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
