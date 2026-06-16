import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onGetTickets: () => void;
}

export default function Navigation({ onGetTickets }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Events', href: '#events' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3'
            : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-white/90 backdrop-blur-lg shadow-float'
                : 'bg-white/70 backdrop-blur-md'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-8">
                <a href="#home" className="text-xl font-bold text-[#cd2bee]">
                  The Lights Festival
                </a>

                <div className="hidden md:flex items-center gap-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm font-medium text-gray-700 hover:text-[#cd2bee] transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={onGetTickets}
                  className="hidden sm:block px-6 py-2 bg-[#cd2bee] text-white rounded-full font-semibold hover:bg-[#a61cbd] transition-colors shadow-glow"
                >
                  Get Tickets
                </button>

                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 text-gray-700 hover:text-[#cd2bee]"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white/95 backdrop-blur-lg z-50 shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <span className="text-xl font-bold text-[#cd2bee]">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-700 hover:text-[#cd2bee]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-2 p-6">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-gray-700 hover:text-[#cd2bee] py-3 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGetTickets();
                  }}
                  className="mt-4 px-6 py-3 bg-[#cd2bee] text-white rounded-full font-semibold hover:bg-[#a61cbd] transition-colors shadow-glow"
                >
                  Get Tickets
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
