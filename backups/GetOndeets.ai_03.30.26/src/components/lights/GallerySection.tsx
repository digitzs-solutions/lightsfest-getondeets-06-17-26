export default function GallerySection() {
  const images = [
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ2QiMjeETFBU24sFoLFljDq-7_uPHwXt-M-OelrG8jXmTcF2GsNArzNUrL8bGJWG5KT12lroJMPIKwn9hvg13OpNdmPn7zHVXus1E7JNZnTlF_tq8XYv9K2wJTk12LusFtH4gkeqXsqtn_ROgsR1rUE2Sl9zQuBZ9XKRfzVS2EMVbzdgFJKaaemIexwH0OASBMCbfBtSLFniVnLWEYYgDai2FjXC-BGPeq4pE2CGk6hKieiLZ1bG80T5D-Mn3URyPS45EtalN318',
      alt: 'People watching lanterns',
      className: 'row-span-2',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa6VH39w-Pke2ihkV7gIDdhJUcpek0Ve1do69YTJoqeFvI3DjNlS2N16bV0FE7-4h3LbURh7oyEUZbvodCtvMDwPoZMvIKim35xLjUVRNEiye3TBMhe-9_Bn-3eHPkX0Yhdfd7ZyFE0k_5SE2Pbr4BoR1uK7ibRNyZY2vzoOaYKspc5mVT_fKG4pnLoSD8bh-2a9gI-Sv5eKXCTWF43yivX55f0uV9yWyBunJEPp8f78zHJ2JB4OU9HjR5G4x24s5hLdkkPnH3ZRo',
      alt: 'Skier with flare',
      className: 'row-span-1',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATK35NqHzy-aZSnWMzy2uYieeU3ATsSv-GNwD8EO6g4hzn8ALGBuJizuZ0ZSC0bmDwZDJhy_LIp1QH3qAywYLGChX7QrIU3YwIXiYbAETDM7CEbCMyfpvH1SzKmvyXbSc301YlqAckx0Lkgr6d5ePjAdXTMUWSoMvnCdtfl4WnxW-U9Y6JL-Ij7w2DTs33s-islSVlE0aGqN9JEfMZvz5ALzvIxki0g5hqIN0N1fIUZlhfF43JWC2n_hdNhrObLfccMV3jwtF1-F8',
      alt: 'Silhouette',
      className: 'row-span-1',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkIYF7ikEP7JxcwbYx2gqcIe3Y4e8s6pv9giZCJGciEFIS9UpygiKVbXRvTI_JviviQr3x6OUp16Vpu9b-VNUp_K-cT4gqaF7kGfWjUBxxDzwFC8WDF2IQohnigdNgEvHW0VQja2OIBo-l0w24gzLcSDCQJjgjQYFqc-DUucDHcWvmDeRHEpAruLO-D14Uf9WDS9a6cL759R9XenUlBDUC9fypHwqkl9uKzNFCrU1DOvh3KY2JLApTXqjggqcR0SmjQgnJaodgAw8',
      alt: 'Mountain landscape',
      className: 'row-span-2',
    },
  ];

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#f8f6f8]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Captured Moments
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Glimpses of magic from festivals around the world
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {images.map((image, index) => (
            <div
              key={index}
              className={`${image.className} overflow-hidden rounded-3xl group cursor-pointer`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
