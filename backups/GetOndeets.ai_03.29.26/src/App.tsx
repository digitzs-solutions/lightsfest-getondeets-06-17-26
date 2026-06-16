import EventsSection from './components/EventsSection';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">LightsFest Events</h1>
        </div>
      </header>
      <EventsSection />
    </div>
  );
}

export default App;
