export default function MarqueeStrip() {
  const words = ['DREAM', 'IGNITE', 'CONNECT', 'GLOW'];
  const repeatedWords = [...words, ...words, ...words, ...words];

  return (
    <div className="bg-[#cd2bee] py-6 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeatedWords.map((word, index) => (
          <span
            key={index}
            className="inline-flex items-center text-white text-3xl sm:text-4xl md:text-5xl font-bold mx-8"
          >
            {word}
            <span className="mx-8 text-white/50">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
