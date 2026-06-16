import { Check, ArrowRight } from 'lucide-react';

const solutions = [
  {
    name: 'Starter',
    price: '2,499',
    period: 'per station',
    description: 'Perfect for small properties and residential communities getting started with EV charging.',
    features: [
      'Level 2 Charging (7.2kW)',
      'Single charging port',
      'Mobile app management',
      'Basic usage analytics',
      'Email support',
      '1-year warranty',
      'Standard installation included'
    ],
    highlighted: false,
    cta: 'Get Started'
  },
  {
    name: 'Professional',
    price: '4,999',
    period: 'per station',
    description: 'Ideal for commercial properties and businesses requiring faster charging and advanced features.',
    features: [
      'DC Fast Charging (50kW)',
      'Dual charging ports',
      'Advanced dashboard & analytics',
      'Custom branding options',
      'Automated billing system',
      '24/7 priority support',
      '3-year warranty',
      'Professional installation included',
      'Load management system'
    ],
    highlighted: true,
    badge: 'MOST POPULAR',
    cta: 'Get Started'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'volume pricing',
    description: 'Comprehensive solution for large-scale deployments with ultra-fast charging and white-label options.',
    features: [
      'Ultra-Fast Charging (350kW)',
      'Multiple charging ports',
      'White-label platform',
      'API access & integrations',
      'Custom pricing models',
      'Dedicated account manager',
      'Lifetime warranty',
      'Full-service installation',
      'Advanced load balancing',
      'Custom hardware options'
    ],
    highlighted: false,
    cta: 'Contact Sales'
  }
];

export default function Solutions() {
  return (
    <section id="solutions" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-4">
            SOLUTIONS & PRICING
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose the Perfect Plan for Your Property
          </h2>
          <p className="text-xl text-gray-600">
            Flexible solutions designed to meet your specific needs, from single stations to enterprise-wide deployments.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl shadow-xl transition-all duration-300 ${
                solution.highlighted
                  ? 'border-2 border-blue-500 scale-105 lg:scale-110 z-10'
                  : 'border border-gray-200 hover:border-blue-300 hover:shadow-2xl'
              }`}
            >
              {solution.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  {solution.badge}
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{solution.name}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    {solution.price !== 'Custom' && (
                      <span className="text-2xl font-semibold text-gray-900">$</span>
                    )}
                    <span className="text-5xl font-bold text-gray-900">{solution.price}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{solution.period}</p>
                </div>

                <button
                  className={`w-full py-4 rounded-xl font-bold transition-all mb-8 flex items-center justify-center gap-2 group ${
                    solution.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {solution.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing the right solution? Our experts are here to help.
          </p>
          <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-2">
            Schedule a Consultation
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
