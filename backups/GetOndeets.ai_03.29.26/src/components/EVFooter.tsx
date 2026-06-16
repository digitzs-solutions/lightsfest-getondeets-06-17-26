import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function EVFooter() {
  const footerSections = [
    {
      title: 'Solutions',
      links: ['Commercial', 'Residential', 'Retail & Hospitality', 'Fleet Management']
    },
    {
      title: 'Resources',
      links: ['Documentation', 'Case Studies', 'Blog', 'EV Guides']
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Partners', 'Contact']
    },
    {
      title: 'Support',
      links: ['Help Center', 'Installation', 'API Docs', 'System Status']
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-white">
                Digit<span className="text-blue-400">ZS</span>
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Leading the charge in intelligent EV infrastructure solutions. Power your future with cutting-edge technology and unmatched reliability.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <a href="mailto:info@digitzs.com" className="text-white hover:text-blue-400 transition-colors">
                  info@digitzs.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Phone</div>
                <a href="tel:+1234567890" className="text-white hover:text-blue-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="text-white">San Francisco, CA</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div>
              © 2024 DigitZS. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
