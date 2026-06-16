import { Heart, Users, Zap } from 'lucide-react';

export default function DinoAbout() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              WHAT IS <span className="text-emerald-400">THIS?</span>
            </h2>
            <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
              <p className="text-xl font-bold text-white">
                Get Ready for the Walkthrough of a Lifetime!
                <br />
                <span className="text-emerald-400">Where prehistoric creatures come to life!</span>
              </p>
              <p>
                Step into the ultimate immersion experience! Authentic movie sets, surround sound,
                mind-blowing visuals, and real danger at every turn. It's a heart-racing journey
                through a land where dinosaurs rule the earth—featuring thrilling escape room
                elements and world-class props.
              </p>
              <p className="font-semibold text-white">
                Get ready to survive the ultimate prehistoric challenge!
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/6156607/pexels-photo-6156607.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Dinosaur experience"
              className="rounded-2xl shadow-2xl border-4 border-emerald-500/30"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500 transition-all group">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Who is this for?</h3>
            <p className="text-slate-300 leading-relaxed">
              Love a good thrill? This adventure is for you! Children and adults will experience
              heart-pounding, jump-scare fun—without the gore. Perfect for families, friends, and
              adrenaline junkies alike.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500 transition-all group">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
              <Zap className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">What to Expect</h3>
            <p className="text-slate-300 leading-relaxed">
              Your adventure begins in Dr. Verne's office... then spirals into chaos! Dark hallways,
              jump scares, retro music, and thrilling escapes. Can you outrun a T-Rex? You'll find
              out soon enough!
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-emerald-500 transition-all group">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
              <Heart className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Family Friendly</h3>
            <p className="text-slate-300 leading-relaxed">
              Expect plenty of jump scares that will have you laughing and screaming! No gore—just
              pure, heart-racing fun. Recommended for high elementary kids through adults.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
