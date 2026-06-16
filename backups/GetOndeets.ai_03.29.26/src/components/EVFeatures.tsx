import { Zap, Shield, Smartphone, TrendingUp, Clock, Headphones as HeadphonesIcon } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Ultra-Fast Charging',
    description: 'Industry-leading charging speeds up to 350kW, getting drivers back on the road faster.',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    icon: Smartphone,
    title: 'Smart Management',
    description: 'Monitor and control your charging stations remotely with our intuitive mobile app and web dashboard.',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and authentication protocols protect your network and user data.',
    color: 'from-green-400 to-emerald-500'
  },
  {
    icon: TrendingUp,
    title: 'Revenue Optimization',
    description: 'Flexible pricing models and automated billing maximize your return on investment.',
    color: 'from-purple-400 to-pink-500'
  },
  {
    icon: Clock,
    title: 'Always Available',
    description: '99.9% uptime guarantee with predictive maintenance and real-time diagnostics.',
    color: 'from-red-400 to-orange-500'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Expert technical support team ready to assist you anytime, anywhere.',
    color: 'from-indigo-400 to-blue-500'
  }
];

export default function EVFeatures() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Power the Future
          </h2>
          <p className="text-xl text-gray-600">
            Our comprehensive EV charging solutions are designed to meet the demands of modern electric mobility
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-full h-full text-white" strokeWidth={2} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
