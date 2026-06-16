import { Heart, Users, Sparkles } from 'lucide-react';

export default function IntroSection() {
  return (
    <section id="about" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            More Than Just a Festival
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience a transformative evening where thousands of lanterns illuminate the night sky,
            creating moments of wonder, connection, and pure magic.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-20">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#cd2bee]/10 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#cd2bee]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Memories</h3>
                <p className="text-gray-600 leading-relaxed">
                  Watch your wishes take flight as you release your lantern into the night sky,
                  creating an unforgettable moment with friends and loved ones.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#cd2bee]/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#cd2bee]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect Together</h3>
                <p className="text-gray-600 leading-relaxed">
                  Join a community of dreamers from around the world in a shared experience
                  of hope, wonder, and human connection.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#cd2bee]/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#cd2bee]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pure Magic</h3>
                <p className="text-gray-600 leading-relaxed">
                  Immerse yourself in live music, art installations, and the breathtaking
                  spectacle of thousands of lanterns lighting up the darkness.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr45zpc6jf-p244x_pxxkIB9B-fNC2p5qVLPTeR9K2eHqNcKFK23CnXQqbTRQpukKu8R9_jgX7VpKtn94xGsRDq4_-dKnDE3sBaYfeLDfV-RojE7Ef35rM1YjvwdjxCqmRU8IJbGiu83c0UiuWtkAgTh5B8LhZCIKDWQGV5J8DSWbWitXYWo2BowoLDpmX6Q-6EpHzqwyvNYqUrUCtq3Gya28qo84BUekyoeH7vze2RQZxgLoX9WZyfNuZfyO1uPNhLpnF4waoqLU"
                alt="Person with lantern"
                className="w-full h-64 object-cover rounded-3xl shadow-lg"
              />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXJ4_k1CiTC34uUsq42DeEM4b1rCZ5Xqsexgxfz2f2QTimaq6fUlpyzvM0wCIiaNJyjS1nIaV3BOc-HFfz11N9agJw1hPoufvfT5Hi-80GxwMgO3LpHJg1yW8Zugek0b3AZMtUSiO--ijiCtPhYPNsO51P4Icpe7IC6V4ymEHMbRDt1ivTFbEs8VaVO78ubqvBToP_NUtINRkp6ksFYeWPKZP0cP9wmp0MKalFYRO0XTf8fXowiUojjwNVCZO21-5CThhcIWj0WRo"
                alt="Friends at festival"
                className="w-full h-80 object-cover rounded-3xl shadow-lg"
              />
            </div>
            <div className="pt-12">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9qfL0PLEmCqV41_x6YtMMvMn0rzGh0jRop1vfLj7uOHXL4oRllQhetYuquOrvHucp-blIBjnxGnXc-7XQcc9vQaasOF_K63uZw5vWIHBLNYTmPrnq3E235cAP994cmNxdqtFH4w6Op9Z8AP8Wdj-VbqvH3ZGOfXXBmfWrbDeZLGQiFQ2qlAcMkQSovIFrQu8Co174ZPkKBDICNkqHT60BpjFhfVUYHLvdAPZpViPnOVoXHcqz79MLEY_qaE-rVIllstYQa4xeIeM"
                alt="Lanterns in sky"
                className="w-full h-96 object-cover rounded-3xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
