import { Users, Heart, Briefcase, Link2 } from 'lucide-react';

export default function GetInvolved() {
  const opportunities = [
    {
      id: 'volunteers',
      icon: Users,
      title: 'Volunteers',
      description: 'Join our passionate team and help make this event unforgettable for thousands of guests.',
      link: '#volunteers',
    },
    {
      id: 'charities',
      icon: Heart,
      title: 'Charities',
      description: 'Partner with us to support meaningful causes and give back to our community.',
      link: '#charities',
    },
    {
      id: 'sponsors',
      icon: Briefcase,
      title: 'Sponsors & Exhibitors',
      description: 'Showcase your brand to thousands of engaged festival attendees.',
      link: '#sponsors',
    },
    {
      id: 'affiliate',
      icon: Link2,
      title: 'Affiliate Program',
      description: 'Earn commissions by promoting The Lights Fest to your audience.',
      link: '#affiliate',
    },
  ];

  return (
    <section id="get-involved" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get Involved</h2>
          <p className="text-xl text-gray-600">There are many ways to be part of The Lights Fest community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {opportunities.map((opp) => {
            const Icon = opp.icon;
            return (
              <a
                key={opp.id}
                href={opp.link}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow hover:border-orange-500 border-2 border-transparent group"
              >
                <Icon className="w-12 h-12 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                <p className="text-gray-600 text-sm">{opp.description}</p>
                <div className="mt-4 text-orange-500 font-semibold text-sm group-hover:gap-2 inline-flex gap-1 transition-all">
                  Learn More →
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
