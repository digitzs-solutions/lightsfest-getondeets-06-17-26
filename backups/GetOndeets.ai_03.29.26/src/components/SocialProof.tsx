import { Building2, Home, Store, Truck, CheckCircle } from 'lucide-react';

export default function SocialProof() {
  const stats = [
    { number: '10,000+', label: 'Active Stations', description: 'Deployed Nationwide' },
    { number: '5M+', label: 'Charging Sessions', description: 'Completed Monthly' },
    { number: '500+', label: 'Properties', description: 'Powered by DigitZS' },
    { number: '4.9/5', label: 'Customer Rating', description: 'From 2,000+ Reviews' }
  ];

  const clients = [
    { icon: Building2, name: 'Commercial Real Estate', count: '250+ Properties' },
    { icon: Home, name: 'Residential Communities', count: '180+ Complexes' },
    { icon: Store, name: 'Retail & Hospitality', count: '120+ Locations' },
    { icon: Truck, name: 'Fleet Operators', count: '50+ Companies' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of forward-thinking organizations who have already made the switch to intelligent EV charging infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-xl font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 border border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Serving Diverse Industries
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clients.map((client, index) => (
              <div
                key={index}
                className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <client.icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{client.name}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {client.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-8 md:gap-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="text-2xl font-bold text-gray-700">Trusted Partner</div>
            <div className="text-2xl font-bold text-gray-700">Industry Certified</div>
            <div className="text-2xl font-bold text-gray-700">Award Winning</div>
          </div>
        </div>
      </div>
    </section>
  );
}
