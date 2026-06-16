import { Calendar, MapPin, ArrowRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  price: number;
  image: string;
  badge?: string;
}

interface EventSliderProps {
  onEventSelect: (event: Event) => void;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Austin Lights Festival',
    location: 'Austin, TX',
    date: 'March 15, 2026',
    price: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaYZ3Q27V_YXcQLn3VY8q-6U8WaW4NcVGz2-KG3CFOKAFXLcI_lh3J4ZRjAgZASSmANOguYPVkiI1O1zAMeZBsvkYraEsMmntk7hXTSDeE3CZSCOx3am6Q77pqQc9sGEWZaQdGDTBIOJA_9QAYxyKbH0icSQx9moFIgfuHsf0YiResu7nKaVzvGV8bUjxc6U-ivArkd7JPfNKY0Dwrv6Z6ZmurdEoennShIwAXxoq04WY46kwq0tc5drdf3RHAL6nbPBWcsXrL384',
    badge: 'SELLING FAST',
  },
  {
    id: '2',
    title: 'London Lights Experience',
    location: 'London, UK',
    date: 'April 20, 2026',
    price: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChylpICTz-CjF2o8IN4AAyfhgduwwOokpNGCWBw4lm6c-w6bGQSOTIoo0rygEEx3tGFYxH4QP_ml33R50r07dVep3apJb753itY_yJ44aR-hDYnZHtDTyxzJp-ojz1KcbHFpH92A4TtbmdBciRFndaQU_wmola6kjZM8bzH_CJsGsHbpDDkCPT0fb55OJfQap8l4risQNPKUTzllHDr-pScsjEWh-UXGlww_ysdN7hzpbGlje6L8ixGsiITOtZHYDaeDcJC4Gi0-0',
    badge: 'NEW',
  },
  {
    id: '3',
    title: 'Tokyo Night Festival',
    location: 'Tokyo, Japan',
    date: 'May 10, 2026',
    price: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtF-6t9KmgUIx7TZy3VuAd-dPsqwQ6dylzzF5EyYD3Tlq8CEyi1MmSj9EFd5TKXDufMUolJWm0bS4LzHaxrO1np6whKIKnbD6IuPRXOmpvolTEFr3_T1dSocAaTUCIWOf0w_cRkK09fMWblbbgbyRDdGIh2Xa8pryAV5MVqVBa6Ao0WTJobEBTeKcLkv4wfS1oyT8Hf7ENLXG47nuKRTJqL8a-mXHynbOkepU7iWnFIjKNxuqt__ECM5_i7aPGEIsqbd7mME9uSqM',
  },
  {
    id: '4',
    title: 'New York Sky Lanterns',
    location: 'New York, NY',
    date: 'June 5, 2026',
    price: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-i2PRvDmubQSxuVZ1Vq8mUSSbAhook5MDwn3GE1gMsYqgWOsWrGs3bMEtI1aFQ3XcszTivbXK64QJ3j5wADy8i_f5WvirgCwGyXDyjp1r9OehG5JpvjUpSpqKJpgwrVTeIt_ljaeSih3kZPaTOjsBZDooHikfTDk8No-lpfQzvfyH81FKFswIYOFsytb_Te5i1UM1DOapqAB-YBq4-cI0ldZuUrkqE04Us2tn1yVONdvefwJrVmdb5S1Y1k7LyIsFcGP3dZ75kKA',
    badge: 'ALMOST SOLD OUT',
  },
];

export default function EventSlider({ onEventSelect }: EventSliderProps) {
  return (
    <section id="events" className="py-20 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Find Your Light
            </h2>
            <p className="text-xl text-gray-600">
              Choose your destination and join the magic
            </p>
          </div>
          <a
            href="#events"
            className="hidden sm:flex items-center gap-2 text-[#cd2bee] font-semibold hover:gap-3 transition-all"
          >
            View All Events
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 pb-4">
          <div className="flex gap-6 w-max">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="w-80 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2"
                onClick={() => onEventSelect(event)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {event.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-[#cd2bee] text-white text-xs font-bold rounded-full">
                      {event.badge}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#cd2bee] transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-sm text-gray-500">From</div>
                      <div className="text-2xl font-bold text-[#cd2bee]">
                        ${event.price}
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-[#cd2bee] text-white rounded-full font-semibold hover:bg-[#a61cbd] transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href="#events"
          className="sm:hidden flex items-center justify-center gap-2 text-[#cd2bee] font-semibold hover:gap-3 transition-all mt-8"
        >
          View All Events
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}
