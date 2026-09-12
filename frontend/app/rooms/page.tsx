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
  },
];

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#1c1c1c]">
      {/* Header */}
      <header className="border-b border-black/10 bg-[#f8f6f1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="group">
            <h1 className="text-xl font-semibold tracking-[0.2em]">
              Valére Haven
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.3em] text-black/50">
              HOTEL & RESORT
            </p>
          </a>


          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="/" className="hover:text-black/50">
              Home
            </a>

            <a href="/rooms" className="font-medium">
              Rooms
            </a>

            <a href="/#experience" className="hover:text-black/50">
              Experience
            </a>

            <a href="/#about" className="hover:text-black/50">
              About
            </a>

            <a href="/#contact" className="hover:text-black/50">
              Contact
            </a>

            <a
              href="/booking/availability"
              className="bg-[#1c1c1c] px-5 py-3 text-white"
            >
              Book Now
            </a>
          </nav>

          <a
            href="/booking/availability"
            className="bg-[#1c1c1c] px-4 py-2 text-sm text-white md:hidden"
          >
            Book
          </a>
        </div>
      </header>

      {/* Page Introduction */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-[0.3em] text-black/50">
            ACCOMMODATION
          </p>

          <h2 className="mt-5 max-w-3xl text-5xl font-light leading-tight md:text-6xl">
            Find the room that feels right for you.
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-7 text-black/60">
            Explore our accommodations and choose a space designed around
            comfort, relaxation, and a memorable stay at Valere Haven.
          </p>
        </div>
      </section>

      {/* Room List */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl space-y-10">
          {rooms.map((room, index) => (
            <article
              key={room.name}
              className="grid overflow-hidden border border-black/10 bg-white md:grid-cols-2"
            >
              {/* Image Placeholder */}
              <div
                className={`flex min-h-[360px] items-center justify-center ${
                  index % 2 === 0
                    ? "bg-[#dedbd3]"
                    : "bg-[#d4d0c7]"
                }`}
              >
                <span className="text-xs tracking-[0.25em] text-black/40">
                  {room.name.toUpperCase()}
                </span>
              </div>

              {/* Room Information */}
              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.25em] text-black/40">
                      ROOM {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3 className="mt-3 text-3xl font-light">
                      {room.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-medium">{room.price}</p>
                    <p className="text-xs text-black/50">per night</p>
                  </div>
                </div>

                <p className="mt-6 leading-7 text-black/60">
                  {room.description}
                </p>

                <p className="mt-4 text-sm leading-6 text-black/50">
                  {room.details}
                </p>

                {/* Features */}
                <div className="mt-7 grid grid-cols-2 gap-y-3 border-t border-black/10 pt-6">
                  {room.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-black/60"
                    >
                      <span className="h-1 w-1 rounded-full bg-black/50" />
                      {feature}
                    </div>
                  ))}
                </div>

                <a
                  href={`/rooms/${room.slug}`}
                  className="mt-8 inline-block w-fit bg-[#1c1c1c] px-6 py-3 text-sm text-white"
                >
                  View Room
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#252525] px-6 py-20 text-center text-white">
        <p className="text-xs tracking-[0.3em] text-white/50">
          PLAN YOUR STAY
        </p>

        <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-light md:text-5xl">
          Your comfortable stay starts here.
        </h2>

        <a
          href="/booking/availability"
          className="mt-8 inline-block bg-white px-7 py-4 text-sm font-medium text-[#1c1c1c]"
        >
          Check Availability
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h3 className="font-semibold tracking-[0.2em]">
            Valére Haven
          </h3>

          <p className="mt-2 text-sm text-black/50">
            Hotel & Resort
          </p>

          <div className="mt-8 flex flex-col gap-2 text-sm text-black/50 md:flex-row md:gap-8">
            <span>reservations@valerehaven.com</span>
            <span>+63 900 000 0000</span>
          </div>
        </div>
      </footer>
    </main>
  );
}