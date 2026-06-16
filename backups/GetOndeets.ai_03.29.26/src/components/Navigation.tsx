import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

interface NavigationProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({ scrolled, mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const navItems = [
    { label: 'Solutions', href: '#solutions' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  const solutionsItems = [
    { label: 'Commercial Properties', href: '#commercial' },
    { label: 'Residential Communities', href: '#residential' },
    { label: 'Retail & Hospitality', href: '#retail' },
    { label: 'Fleet Operations', href: '#fleet' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Digit<span className="text-blue-600">ZS</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-800 hover:text-blue-600'
                }`}
              >
                {item.label}
              </a>
            ))}

            <a
              href="#contact"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contact
            </a>

            <a
              href="#solutions"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2 bg-white border-t border-gray-200">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className="w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
            >
              Solutions
            </button>
            {solutionsOpen && (
              <div className="pl-4 space-y-2">
                {solutionsItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <a
              href="#contact"
              className="block px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <a
              href="#solutions"
              className="block mx-4 mt-4 py-3 text-center bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
