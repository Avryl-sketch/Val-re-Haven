"use client";

import Link from "next/link";

const rooms = [
  {
    slug: "standard",
    name: "Standard Room",
    price: "₱3,500",
    description:
      "A comfortable room designed for a relaxing and convenient stay.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "superior",
    name: "Superior Room",
    price: "₱4,500",
    description:
      "A spacious accommodation with additional space for relaxation.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "deluxe",
    name: "Deluxe Room",
    price: "₱6,000",
    description:
      "A refined room offering more space and premium features.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
];

const experiences = [
  {
    title: "Restaurant & Bar",
    text: "Enjoy delicious meals, refreshing drinks, and a relaxed dining atmosphere throughout your stay.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Swimming Pool",
    text: "Take a refreshing swim or simply relax beside the pool in a peaceful resort atmosphere.",
    image:
      "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Kids' Ground",
    text: "A fun and welcoming space where younger guests can play, explore, and enjoy their stay.",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Spa & Salon",
    text: "Relax, refresh, and enjoy personal care treatments designed to help you feel your best.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fitness Gym",
    text: "Stay active during your visit with a convenient space for workouts and daily exercise.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#1f2d2b]">
      <header className="border-b border-[#1f2d2b]/10 bg-[#f7f2ea] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group">
            <h1 className="text-xl font-semibold tracking-[0.2em] text-[#1b2f2c]">
              Valére Haven
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.32em] text-[#5d6d68]">
              HOTEL & RESORT
            </p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/" className="font-medium text-[#1b2f2c]">
              Home
            </Link>
            <Link href="/rooms" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Rooms
            </Link>
            <a href="#experience" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Experience
            </a>
            <a href="#about" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              About
            </a>
            <a href="#contact" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Contact
            </a>
            <Link
              href="/booking/availability"
              className="bg-[#163d36] px-5 py-3 text-sm text-[#f7f2ea] shadow-sm transition hover:bg-[#102923]"
            >
              Book Now
            </Link>
          </nav>

          <Link
            href="/booking/availability"
            className="bg-[#163d36] px-4 py-2 text-sm text-[#f7f2ea] md:hidden"
          >
            Book
          </Link>
        </div>
      </header>

      <section
        className="relative overflow-hidden bg-[#102923] px-6 py-32 text-white md:py-44"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,41,35,0.72), rgba(16,41,35,0.5)), url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-[0.35em] text-white/70">
            VALÉRE HAVEN HOTEL & RESORT
          </p>

          <h2 className="mt-6 max-w-4xl text-5xl font-light leading-tight md:text-7xl">
            A stay designed around you.
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/75">
            Experience comfort, thoughtful service, and a relaxing atmosphere at Valére Haven.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/booking/availability"
              className="inline-block bg-[#f3d7a8] px-7 py-4 text-sm font-medium text-[#163d36] transition hover:bg-[#ebc88e]"
            >
              Check Availability
            </Link>
            <Link
              href="/rooms"
              className="inline-block border border-white/50 bg-white/5 px-7 py-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              View Rooms
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#5d6d68]">WELCOME</p>
            <h2 className="mt-5 text-4xl font-light leading-tight md:text-5xl text-[#163d36]">
              Comfort made simple.
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="leading-8 text-[#48615d]">
              Valére Haven is designed to provide guests with a comfortable and memorable stay. From thoughtfully designed rooms to attentive guest services, every detail is created with your experience in mind.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1f2d2b]/10 bg-[#f3eee6] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-[0.3em] text-[#5d6d68]">ACCOMMODATION</p>

          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-light text-[#163d36] md:text-5xl">
              Rooms for every kind of stay.
            </h2>
            <Link href="/rooms" className="text-sm text-[#163d36] underline underline-offset-4">
              View all rooms
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <a
                key={room.slug}
                href={`/rooms/${room.slug}`}
                className="group overflow-hidden border border-[#1f2d2b]/10 bg-[#fffdf9] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-light text-[#163d36]">{room.name}</h3>
                    <span className="text-sm text-[#163d36]">{room.price}</span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#5d6d68]">{room.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="overflow-hidden px-6 py-24">
  <div className="mx-auto max-w-7xl">
    <p className="text-xs tracking-[0.3em] text-[#5d6d68]">
      EXPERIENCE
    </p>

    <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <h2 className="max-w-3xl text-4xl font-light leading-tight text-[#163d36] md:text-5xl">
          Everything you need for a comfortable stay.
        </h2>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5d6d68] md:text-base">
          From relaxing spaces to family-friendly activities, Valére Haven
          offers experiences designed to make every stay enjoyable.
        </p>
      </div>

      <p className="hidden whitespace-nowrap text-xs tracking-[0.2em] text-[#5d6d68] md:block">
        SCROLL TO EXPLORE →
      </p>
    </div>

    {/* EXPERIENCE CARDS */}
    <div className="mt-12 -mx-6 overflow-x-auto px-6 pb-6 [scrollbar-width:thin]">
      <div className="flex w-max gap-6">
        {experiences.map((item) => (
          <div
            key={item.title}
            className="group w-[300px] shrink-0 overflow-hidden border border-[#1f2d2b]/10 bg-[#fffdf9] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg md:w-[340px]"
          >
            {/* IMAGE */}
            <div className="h-56 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            {/* CONTENT */}
            <div className="p-7">
              <h3 className="text-2xl font-light text-[#163d36]">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-[#5d6d68]">
                {item.text}
              </p>

              <div className="mt-6 text-xs font-medium tracking-[0.18em] text-[#163d36]">
                DISCOVER MORE →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* MOBILE SCROLL HINT */}
    <p className="mt-2 text-center text-xs tracking-[0.18em] text-[#5d6d68] md:hidden">
      SWIPE TO EXPLORE →
    </p>
  </div>
      </section>

      <section id="about" className="bg-[#163d36] px-6 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-white/60">ABOUT VALÉRE HAVEN</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-light leading-tight md:text-5xl">
              A place to slow down, rest, and feel at home.
            </h2>
            <p className="mt-7 max-w-2xl leading-8 text-white/75">
              Valére Haven combines comfortable accommodations, thoughtful spaces, and welcoming service to create a pleasant experience for every guest.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              alt="Resort pool and terrace"
              className="h-[420px] w-full object-cover"
            />
          </div>
        </div>
      </section>

            {/* PLAN YOUR STAY */}
      <section
        className="relative overflow-hidden px-6 py-28 text-white md:py-36"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,41,35,0.78), rgba(16,41,35,0.72)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-xs tracking-[0.35em] text-white/65">
            PLAN YOUR STAY
          </p>

          <h2 className="mt-6 text-4xl font-light leading-tight md:text-6xl">
            Your comfortable stay starts here.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
            Discover a relaxing stay at Valére Haven, where thoughtful
            spaces, comfortable rooms, and welcoming service come together.
          </p>

          <Link
            href="/booking/availability"
            className="mt-9 inline-block bg-[#f3d7a8] px-8 py-4 text-sm font-medium text-[#163d36] transition hover:bg-[#ebc88e]"
          >
            Book Your Stay
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="border-t border-[#1f2d2b]/10 bg-[#f7f2ea] px-6 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

            {/* BRAND */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold tracking-[0.2em] text-[#163d36]">
                Valére Haven
              </h3>

              <p className="mt-2 text-xs tracking-[0.25em] text-[#5d6d68]">
                HOTEL & RESORT
              </p>

              <p className="mt-6 max-w-xs text-sm leading-7 text-[#5d6d68]">
                A comfortable destination designed for restful stays,
                thoughtful experiences, and warm hospitality.
              </p>
            </div>

            {/* EXPLORE */}
            <div>
              <h4 className="text-xs font-medium tracking-[0.25em] text-[#163d36]">
                EXPLORE
              </h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#5d6d68]">
                <Link
                  href="/"
                  className="transition hover:text-[#163d36]"
                >
                  Home
                </Link>

                <Link
                  href="/rooms"
                  className="transition hover:text-[#163d36]"
                >
                  Rooms
                </Link>

                <Link
                  href="/#experience"
                  className="transition hover:text-[#163d36]"
                >
                  Experience
                </Link>

                <Link
                  href="/#about"
                  className="transition hover:text-[#163d36]"
                >
                  About
                </Link>
              </div>
            </div>

            {/* GUEST SERVICES */}
            <div>
              <h4 className="text-xs font-medium tracking-[0.25em] text-[#163d36]">
                GUEST SERVICES
              </h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#5d6d68]">
                <Link
                  href="/booking/availability"
                  className="transition hover:text-[#163d36]"
                >
                  Check Availability
                </Link>

                <Link
                  href="/booking/availability"
                  className="transition hover:text-[#163d36]"
                >
                  Book a Stay
                </Link>

                <Link
                  href="/#contact"
                  className="transition hover:text-[#163d36]"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <h4 className="text-xs font-medium tracking-[0.25em] text-[#163d36]">
                CONTACT
              </h4>

              <div className="mt-5 flex flex-col gap-3 text-sm leading-6 text-[#5d6d68]">
                <span>reservations@valerehaven.com</span>
                <span>+63 900 000 0000</span>
                <span>Open daily for reservations</span>
              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM */}
          <div className="mt-14 flex flex-col gap-5 border-t border-[#1f2d2b]/10 pt-7 text-xs text-[#5d6d68] md:flex-row md:items-center md:justify-between">
            <p>
              © 2026 Valére Haven Hotel & Resort. All rights reserved.
            </p>

            <a
              href="#"
              className="transition hover:text-[#163d36]"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>
       </main>
  );
}