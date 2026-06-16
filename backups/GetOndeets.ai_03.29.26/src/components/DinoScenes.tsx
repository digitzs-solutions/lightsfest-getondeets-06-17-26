import { Briefcase, Clock, Box, Eye, AlertTriangle, Trees, Flame, Footprints } from 'lucide-react';

const scenes = [
  {
    icon: Briefcase,
    title: "Professor's Office",
    description: "Guests first walk through Professor Verne's office. Admire his time machine sketches, awards, and magazine articles featuring his work.",
    image: "https://images.pexels.com/photos/4226256/pexels-photo-4226256.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    icon: Clock,
    title: "Time Machine",
    description: "Guests enter the room containing the time machine and prepare for the journey of a lifetime.",
    image: "https://images.pexels.com/photos/14751274/pexels-photo-14751274.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    icon: AlertTriangle,
    title: "Arrival Pad",
    description: "As you exit the portal, the room is a disaster. Digital maps show breached fences. Security screens display dinosaurs on the loose and bodies across the compound.",
    image: "https://images.pexels.com/photos/2310713/pexels-photo-2310713.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    icon: Box,
    title: "The Warehouse",
    description: "Navigate through a maze of enormous crates. Dinosaurs can be seen through windows. Crates shake violently as creatures inside try to break free.",
    image: "https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    icon: Eye,
    title: "The Gauntlet",
    description: "Walk through hallways lined with windows. A dinosaur crashes through a window, another smashes through a door. Navigate past snapping jaws!",
    image: "https://images.pexels.com/photos/7673258/pexels-photo-7673258.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    icon: Flame,
    title: "On the Loose",
    description: "Enter the compound where an electrified fence once kept dinosaurs at bay. The fence is damaged, sparks fly from exposed wires. Warning lights flash!",
    image: "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    icon: Trees,
    title: "The Maze",
    description: "The scene calms as you enter a maze of trees with various paths. Move forward with caution as you're startled by roars and rustling leaves.",
    image: "https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    icon: Footprints,
    title: "T-Rex Encounter",
    description: "A massive T-Rex head roars through the trees. WILL YOU BE ABLE TO ESCAPE!",
    image: "https://images.pexels.com/photos/6156607/pexels-photo-6156607.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];

export default function DinoScenes() {
  return (
    <section className="py-24 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            interactive thrill walkthrough <span className="text-emerald-400">scenes</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {scenes.map((scene, idx) => {
            const Icon = scene.icon;
            return (
              <div
                key={idx}
                className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 hover:border-emerald-500 transition-all hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-105"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={scene.image}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-emerald-500/30">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{scene.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{scene.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button className="px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold rounded-xl shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105">
            SAVE YOUR SPOT TODAY!
          </button>
        </div>
      </div>
    </section>
  );
}
