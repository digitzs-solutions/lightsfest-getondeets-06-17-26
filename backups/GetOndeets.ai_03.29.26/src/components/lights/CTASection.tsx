import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="py-20 sm:py-32 bg-[#1f1022] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#cd2bee] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#cd2bee] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          Ready to Glow?
        </h2>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
          Join our community and be the first to know about new events, special offers,
          and exclusive festival experiences.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-[#cd2bee] text-white font-semibold rounded-2xl hover:bg-[#a61cbd] transition-colors shadow-glow whitespace-nowrap"
            >
              Sign Up
            </button>
          </div>
        </form>

        {submitted && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-full text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-medium">Thanks for signing up!</span>
          </div>
        )}

        <p className="mt-8 text-sm text-white/50">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
