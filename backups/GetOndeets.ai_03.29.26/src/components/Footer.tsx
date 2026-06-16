import { Mail, Phone, MapPin, Zap, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Solutions',
      links: [
        { label: 'Commercial Properties', href: '#commercial' },
        { label: 'Residential Communities', href: '#residential' },
        { label: 'Retail & Hospitality', href: '#retail' },
        { label: 'Fleet Operations', href: '#fleet' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Case Studies', href: '#case-studies' },
        { label: 'Documentation', href: '#docs' },
        { label: 'Blog', href: '#blog' },
        { label: 'Support Center', href: '#support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Partners', href: '#partners' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookies' },
        { label: 'Compliance', href: '#compliance' },
      ],
    },
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 py-16">
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

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 pb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
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

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              Copyright &copy; {currentYear} DigitZS. All rights reserved.
            </p>
            <p className="text-xs">
              Powering the electric vehicle revolution, one charge at a time.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
