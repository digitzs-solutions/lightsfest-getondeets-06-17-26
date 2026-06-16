import { Zap, DollarSign, TrendingUp, Shield, Users, Clock } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: 'Lightning-Fast Charging',
    description: 'State-of-the-art charging technology delivers speeds up to 350kW, ensuring your tenants and customers spend less time waiting and more time on the road.',
    gradient: 'from-yellow-400 to-orange-500'
  },
  {
    icon: DollarSign,
    title: 'Maximize Revenue',
    description: 'Turn your charging stations into a profitable revenue stream with flexible pricing models, automated billing, and premium features that attract more users.',
    gradient: 'from-green-400 to-emerald-600'
  },
  {
    icon: TrendingUp,
    title: 'Increase Property Value',
    description: 'Installing EV infrastructure significantly boosts property attractiveness and market value, giving you a competitive edge in today\'s real estate market.',
    gradient: 'from-blue-400 to-cyan-600'
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Bank-level encryption, secure payment processing, and advanced authentication ensure your network and users are always protected.',
    gradient: 'from-purple-400 to-pink-600'
  },
  {
    icon: Users,
    title: 'Attract More Tenants',
    description: 'Meet the growing demand for EV charging amenities and stand out from competitors by offering this essential modern convenience.',
    gradient: 'from-indigo-400 to-blue-600'
  },
  {
    icon: Clock,
    title: 'Set It and Forget It',
    description: 'Our intelligent management system handles everything automatically, from maintenance alerts to software updates, so you can focus on your business.',
    gradient: 'from-red-400 to-orange-600'
  }
];

export default function Benefits() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-4">
            WHY CHOOSE DIGITZS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Power the Electric Future
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of property owners who are already capitalizing on the EV revolution with our comprehensive charging solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-4 mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <benefit.icon className="w-full h-full text-white" strokeWidth={2} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {benefit.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
