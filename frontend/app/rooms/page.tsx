import Link from "next/link";

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

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#1f2d2b]">
      <header className="border-b border-[#1f2d2b]/10 bg-[#f7f2ea]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group">
            <h1 className="text-xl font-semibold tracking-[0.2em] text-[#1b2f2c]">
              Valére Haven
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.3em] text-[#5d6d68]">
              HOTEL & RESORT
            </p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Home
            </Link>
            <Link href="/rooms" className="font-medium text-[#1b2f2c]">
              Rooms
            </Link>
            <Link href="/#experience" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Experience
            </Link>
            <Link href="/#about" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              About
            </Link>
            <Link href="/#contact" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Contact
            </Link>
            <Link href="/booking/availability" className="bg-[#163d36] px-5 py-3 text-white shadow-sm hover:bg-[#102923]">
              Book Now
            </Link>
          </nav>

          <Link href="/booking/availability" className="bg-[#163d36] px-4 py-2 text-sm text-white md:hidden">
            Book
          </Link>
        </div>
      </header>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#5d6d68]">ACCOMMODATION</p>
            <h2 className="mt-5 max-w-3xl text-5xl font-light leading-tight text-[#163d36] md:text-6xl">
              Find the room that feels right for you.
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#47615d]">
              Explore our accommodations and choose a space designed around comfort, relaxation, and a memorable stay at Valére Haven.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#1f2d2b]/10 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80"
              alt="Modern luxury hotel room"
              className="h-[420px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl space-y-10">
          {rooms.map((room, index) => (
            <article key={room.name} className="grid overflow-hidden border border-[#1f2d2b]/10 bg-[#fffdf9] shadow-sm md:grid-cols-2">
              <div className="min-h-[360px] overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.25em] text-[#5d6d68]">
                      ROOM {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-3xl font-light text-[#163d36]">{room.name}</h3>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-medium text-[#163d36]">{room.price}</p>
                    <p className="text-xs text-[#5d6d68]">per night</p>
                  </div>
                </div>

                <p className="mt-6 leading-7 text-[#47615d]">{room.description}</p>
                <p className="mt-4 text-sm leading-6 text-[#5d6d68]">{room.details}</p>

                <div className="mt-7 grid grid-cols-2 gap-y-3 border-t border-[#1f2d2b]/10 pt-6">
                  {room.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-[#39514d]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d4b07a]" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Link href={`/rooms/${room.slug}`} className="mt-8 inline-block w-fit bg-[#163d36] px-6 py-3 text-sm text-[#f7f2ea] hover:bg-[#102923]">
                  View Room
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#163d36] px-6 py-20 text-center text-white">
        <p className="text-xs tracking-[0.3em] text-white/60">PLAN YOUR STAY</p>
        <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-light md:text-5xl">
          Your comfortable stay starts here.
        </h2>
        <Link href="/booking/availability" className="mt-8 inline-block bg-[#f3d7a8] px-7 py-4 text-sm font-medium text-[#163d36] hover:bg-[#ebc88e]">
          Check Availability
        </Link>
      </section>

      <footer className="border-t border-[#1f2d2b]/10 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h3 className="font-semibold tracking-[0.2em] text-[#163d36]">Valére Haven</h3>
          <p className="mt-2 text-sm text-[#5d6d68]">Hotel & Resort</p>
          <div className="mt-8 flex flex-col gap-2 text-sm text-[#5d6d68] md:flex-row md:gap-8">
            <span>reservations@valerehaven.com</span>
            <span>+63 900 000 0000</span>
          </div>
        </div>
      </footer>
    </main>
  );
}