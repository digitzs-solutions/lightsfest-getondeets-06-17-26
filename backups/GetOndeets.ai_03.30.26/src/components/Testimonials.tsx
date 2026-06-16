import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Property Manager',
    company: 'Downtown Apartments',
    image: 'https://images.pexels.com/photos/3765035/pexels-photo-3765035.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    text: 'Installing DigitZS charging stations was the best decision we made for our property. Our occupancy rate increased by 15% within 6 months, and tenants absolutely love the convenience. The installation was seamless and support has been outstanding.'
  },
  {
    name: 'Michael Chen',
    role: 'Director of Operations',
    company: 'Premier Shopping Center',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    text: 'The EV charging stations have become a major draw for customers. We\'ve seen increased foot traffic and longer visit durations. The revenue from the charging network has exceeded our projections, and the system practically runs itself.'
  },
  {
    name: 'Jennifer Rodriguez',
    role: 'Facilities Director',
    company: 'TechCorp Industries',
    image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    text: 'Our employees were asking for EV charging, and DigitZS delivered beyond expectations. The smart management system makes it easy to track usage and costs. It\'s been a fantastic addition to our sustainability initiatives and employee benefits.'
  },
  {
    name: 'David Thompson',
    role: 'Fleet Manager',
    company: 'Express Logistics',
    image: 'https://images.pexels.com/photos/2182975/pexels-photo-2182975.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    text: 'Transitioning our fleet to electric vehicles was daunting, but DigitZS made it simple. The charging infrastructure is reliable, the reporting tools are comprehensive, and we\'ve cut our fuel costs by 60%. Couldn\'t be happier with the results.'
  },
  {
    name: 'Amanda Foster',
    role: 'General Manager',
    company: 'Luxury Resort & Spa',
    image: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    text: 'Our guests expect premium amenities, and EV charging is now essential. DigitZS provided a solution that matches our luxury brand while being incredibly user-friendly. Guest satisfaction scores have improved significantly since installation.'
  },
  {
    name: 'Robert Jackson',
    role: 'Community Board President',
    company: 'Riverside Condominiums',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    rating: 5,
    text: 'As more residents purchased electric vehicles, we knew we needed a charging solution. DigitZS handled everything from permits to installation. The billing system is transparent, and residents appreciate the convenience of charging at home.'
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-4">
            TESTIMONIALS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See What Our Customers Are Saying
          </h2>
          <p className="text-xl text-gray-600">
            Real stories from real customers who have transformed their properties with DigitZS charging solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600 font-semibold">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-100" />
                <p className="text-gray-700 leading-relaxed pl-6">
                  {testimonial.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-6 py-4 rounded-xl">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 5).map((t, i) => (
                <img
                  key={i}
                  src={t.image}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div className="text-left ml-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-900">4.9/5</span>
              </div>
              <p className="text-sm text-gray-600">from 2,000+ reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
