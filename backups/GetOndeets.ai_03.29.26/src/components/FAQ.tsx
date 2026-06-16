import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How long does installation typically take?',
      answer: 'Most installations are completed within 1-3 days, depending on the complexity and number of stations. Our professional installation team handles everything from permits to final testing, ensuring minimal disruption to your property operations.',
    },
    {
      question: 'What are the ongoing maintenance requirements?',
      answer: 'Our stations feature predictive maintenance technology and require minimal upkeep. We provide automatic software updates, 24/7 remote monitoring, and proactive issue detection. Most customers only need quarterly inspections, which our team can handle.',
    },
    {
      question: 'Can I set my own pricing for charging sessions?',
      answer: 'Absolutely! You have complete control over pricing models. Set hourly rates, per-kWh pricing, flat fees, or create custom packages. Our platform also supports free charging for specific users or time periods, giving you maximum flexibility.',
    },
    {
      question: 'What payment methods are supported?',
      answer: 'Our stations accept all major credit and debit cards, mobile payments including Apple Pay and Google Pay, and RFID cards. Users can also pay through our mobile app with stored payment methods for seamless experiences.',
    },
    {
      question: 'How does the revenue sharing work?',
      answer: 'You keep 100% of the charging revenue. We offer transparent monthly billing for the management platform and services with no hidden fees. Volume discounts and enterprise packages are available for larger deployments.',
    },
    {
      question: 'What happens if a station malfunctions?',
      answer: 'Our 24/7 monitoring system detects issues immediately and alerts our support team. Most problems are resolved remotely within minutes. For hardware issues, we dispatch technicians typically within 4 hours, with loaner units available for extended repairs under our uptime guarantee.',
    },
    {
      question: 'Are there any incentives or rebates available?',
      answer: 'Yes! Federal tax credits, state rebates, and utility incentives can significantly reduce installation costs. Our team provides a comprehensive incentives assessment and handles all paperwork to maximize your savings, often covering 30-50% of project costs.',
    },
    {
      question: 'Can the system integrate with my existing property management software?',
      answer: 'We offer API access and pre-built integrations with major property management platforms. Our development team can also create custom integrations to ensure seamless data flow between systems, including billing, access control, and reporting.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-4">
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Find answers to common questions about DigitZS EV charging solutions</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-blue-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 p-8 rounded-lg text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">Our support team is here to help you 24/7</p>
          <a
            href="#contact"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
