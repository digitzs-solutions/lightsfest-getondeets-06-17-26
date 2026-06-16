import DinoNavigation from './components/DinoNavigation';
import DinoHero from './components/DinoHero';
import DinoTickets from './components/DinoTickets';
import DinoAbout from './components/DinoAbout';
import DinoScenes from './components/DinoScenes';
import DinoFAQ from './components/DinoFAQ';
import DinoFooter from './components/DinoFooter';

export default function DinoApp() {
  return (
    <div className="min-h-screen bg-slate-900">
      <DinoNavigation />
      <DinoHero />
      <section id="tickets">
        <DinoTickets />
      </section>
      <section id="about">
        <DinoAbout />
      </section>
      <section id="scenes">
        <DinoScenes />
      </section>
      <section id="faq">
        <DinoFAQ />
      </section>
      <DinoFooter />
    </div>
  );
}
