const rooms = [
  {
    slug: "standard",
    name: "Standard Room",
    price: "₱3,500",
    description:
      "A comfortable room designed for a relaxing and convenient stay.",
    details:
      "The Standard Room features a Queen Bed, bedside tables, a relaxing view, comfort room, and a convenient desk and coffee area.",
    features: ["Queen Bed", "Private Comfort Room", "Desk & Coffee Area", "View"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "superior",
    name: "Superior Room",
    price: "₱4,500",
    description:
      "A spacious accommodation with additional space for relaxation.",
    details:
      "The Superior Room features a Queen Bed, a large view, private comfort room, desk and coffee area, and a cozy sitting area.",
    features: [
      "Queen Bed",
      "Large View",
      "Private Comfort Room",
      "Sitting Area",
      "Desk & Coffee Area",
    ],
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "deluxe",
    name: "Deluxe Room",
    price: "₱6,000",
    description:
      "A refined room offering more space and premium features.",
    details:
      "The Deluxe Room features a King Bed, large view, private comfort room with bathtub, desk and coffee area, sitting area, and a private balcony.",
    features: [
      "King Bed",
      "Private Balcony",
      "Bathtub",
      "Sitting Area",
      "Desk & Coffee Area",
    ],
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "executive",
    name: "Executive Room",
    price: "₱8,000",
    description:
      "A premium accommodation offering generous space and comfort.",
    details:
      "The Executive Room features a King Bed, large view, private comfort room, desk and coffee area, spacious sitting area and a private balcony.",
    features: [
      "King Bed",
      "Premium Space",
      "Large View",
      "Sitting Area",
      "Desk & Coffee Area",
      "Private Balcony",
    ],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "suite",
    name: "Suite Room",
    price: "₱10,000",
    description:
      "A spacious and luxurious accommodation designed for guests seeking extra comfort and privacy.",
    details:
      "The Suite Room offers a generous space with a King Bed, separate living area, large view, private comfort room, desk and coffee area, premium amenities and a private balcony.",
    features: [
      "King Bed",
      "Separate Living Area",
      "Large View",
      "Private Comfort Room",
      "Desk & Coffee Area",
      "Premium Space",
      "Private Balcony",
    ],
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
  },
];

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = rooms.find((item) => item.slug === slug) ?? rooms[0];

  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#1f2d2b]">
      <header className="border-b border-[#1f2d2b]/10 bg-[#f7f2ea]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="group">
            <h1 className="text-xl font-semibold tracking-[0.2em] text-[#1b2f2c]">
              Valére Haven
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.3em] text-[#5d6d68]">
              HOTEL & RESORT
            </p>
          </a>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="/" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Home
            </a>
            <a href="/rooms" className="font-medium text-[#1b2f2c]">
              Rooms
            </a>
            <a href="/booking/availability" className="bg-[#163d36] px-5 py-3 text-white shadow-sm hover:bg-[#102923]">
              Book Now
            </a>
          </nav>
        </div>
      </header>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl overflow-hidden border border-[#1f2d2b]/10 bg-[#fffdf9] shadow-sm">
          <div className="grid md:grid-cols-2">
            <div className="min-h-[420px] overflow-hidden">
              <img
                src={room.image}
                alt={room.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="text-xs tracking-[0.25em] text-[#5d6d68]">ROOM DETAILS</p>
              <h1 className="mt-4 text-4xl font-light text-[#163d36] md:text-5xl">
                {room.name}
              </h1>

              <div className="mt-6 flex items-end gap-4">
                <span className="text-3xl font-medium text-[#163d36]">{room.price}</span>
                <span className="text-sm text-[#5d6d68]">per night</span>
              </div>

              <p className="mt-6 leading-7 text-[#47615d]">{room.description}</p>
              <p className="mt-4 text-sm leading-7 text-[#5d6d68]">{room.details}</p>

              <div className="mt-8 grid gap-3 border-t border-[#1f2d2b]/10 pt-6">
                {room.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-[#39514d]">
                    <span className="h-2 w-2 rounded-full bg-[#d4b07a]" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a href="/rooms" className="inline-block border border-[#1f2d2b]/20 px-6 py-3 text-sm text-[#163d36] hover:border-[#163d36]">
                  Back to Rooms
                </a>
                <a
                  href={`/booking/availability?room=${room.slug}`}
                  className="inline-block bg-[#163d36] px-6 py-3 text-sm text-[#f7f2ea] hover:bg-[#102923]"
                >
                  Book This Room
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1f2d2b]/10 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h3 className="font-semibold tracking-[0.2em] text-[#163d36]">Valére Haven</h3>
          <p className="mt-2 text-sm text-[#5d6d68]">Hotel & Resort</p>
        </div>
      </footer>
    </main>
  );
}