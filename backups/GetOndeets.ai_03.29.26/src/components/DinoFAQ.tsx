import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "What type of ride is this?",
    answer: "Get ready to step into the ultimate immersion experience! We're taking you back in time—right into the heart of a prehistoric adventure. Picture yourself living inside a thriller movie where dinosaurs are real, the danger is real, and every step you take could lead to a close encounter with a giant T-Rex or a raptor on the prowl. This isn't just a walk-through; it's like living a scene from your favorite dinosaur film! With authentic movie set props, surround sound, and mind-blowing visuals, you'll feel like you're right in the action."
  },
  {
    question: "Are there escape rooms?",
    answer: "Yes—escape room elements will challenge your wits as you try to find your way to safety. Think you've been to a haunted house before? Well, this takes it to the next level! While it shares that thrilling, heart-pounding excitement, this experience also has the high-end imagery and props you'd expect from a world-class amusement park like Disney or Universal. Can you survive the thrills, jumpscares, and heart-racing moments to make it out alive? Only one way to find out... experience it yourself!"
  },
  {
    question: "What audience is this for?",
    answer: "This adventure is perfect for anyone who loves a good thrill! Expect plenty of jump scares that will have you laughing and screaming at the same time. There's no gore here—just pure, heart-racing fun! We recommend this experience for high elementary kids (though the choice always remains with the parents) all the way up to adults. If you're ready for an adrenaline-packed journey with dinosaurs, this is the place for you!"
  },
  {
    question: "Where is this located?",
    answer: "In Tampa, Florida"
  },
  {
    question: "What is the price?",
    answer: "Cost starts at $32 per person"
  }
];

export default function DinoFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="text-emerald-400">FAQs</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Can't find the answer you're looking for? Look at our FAQs
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500 transition-all overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <span className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-emerald-400 transition-transform ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-5">
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
