import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const links = {
    festival: [
      { label: 'About Us', href: '#about' },
      { label: 'Events', href: '#events' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: '#contact' },
    ],
    support: [
      { label: 'Help Center', href: '#help' },
      { label: 'Safety', href: '#safety' },
      { label: 'Terms', href: '#terms' },
      { label: 'Privacy', href: '#privacy' },
    ],
  };

  return (
    <footer id="contact" className="bg-[#1f1022] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">The Lights Festival</h3>
            <p className="text-white/70 mb-6 max-w-md leading-relaxed">
              Creating unforgettable experiences of light, music, and human connection
              across the globe. Join us in illuminating the night sky.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#cd2bee] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#cd2bee] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#cd2bee] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#cd2bee] transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Festival</h4>
            <ul className="space-y-2">
              {links.festival.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-[#cd2bee] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              {links.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-[#cd2bee] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-sm">
          <p>&copy; 2026 The Lights Festival. All rights reserved.</p>
          <p>Secure payments powered by Payvia & TokenEx</p>
        </div>
      </div>
    </footer>
  );
}
