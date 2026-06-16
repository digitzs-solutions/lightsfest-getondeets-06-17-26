import { Building2, Home, Store, Truck } from 'lucide-react';

const solutions = [
  {
    icon: Building2,
    title: 'Commercial Properties',
    description: 'Attract tenants and increase property value with cutting-edge EV infrastructure',
    features: ['Multi-tenant billing', 'Load management', 'Access control', 'Usage analytics'],
    image: 'bg-gradient-to-br from-blue-500 to-blue-700'
  },
  {
    icon: Home,
    title: 'Residential Communities',
    description: 'Provide convenient charging for residents with smart, scalable solutions',
    features: ['Resident authentication', 'Simple billing', 'Energy optimization', 'Mobile app access'],
    image: 'bg-gradient-to-br from-green-500 to-emerald-700'
  },
  {
    icon: Store,
    title: 'Retail & Hospitality',
    description: 'Drive foot traffic and enhance customer experience with premium charging',
    features: ['Customer engagement', 'Branding options', 'Payment integration', 'Loyalty programs'],
    image: 'bg-gradient-to-br from-purple-500 to-purple-700'
  },
  {
    icon: Truck,
    title: 'Fleet Operations',
    description: 'Optimize your electric fleet with intelligent charging infrastructure',
    features: ['Fleet management', 'Route optimization', 'Cost tracking', 'Maintenance alerts'],
    image: 'bg-gradient-to-br from-orange-500 to-red-700'
  }
];

export default function EVSolutions() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Tailored Solutions for Every Need
          </h2>
          <p className="text-xl text-gray-600">
            Whether you're managing a commercial property, residential community, retail location, or electric fleet,
            we have the perfect charging solution
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className={`${solution.image} p-8 text-white`}>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
                  <solution.icon className="w-full h-full" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{solution.title}</h3>
                <p className="text-white/90 text-lg">{solution.description}</p>
              </div>

              <div className="p-8">
                <ul className="space-y-3">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="mt-6 w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
