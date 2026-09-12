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

export default function Home() {
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

            <a href="/" className="font-medium">
              Home
            </a>

            <a href="/rooms" className="hover:text-black/50">
              Rooms
            </a>

            <a href="#experience" className="hover:text-black/50">
              Experience
            </a>

            <a href="#about" className="hover:text-black/50">
              About
            </a>

            <a href="#contact" className="hover:text-black/50">
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


      {/* Hero */}
      <section className="relative bg-[#252525] px-6 py-32 text-white md:py-44">

        <div className="mx-auto max-w-7xl">

          <p className="text-xs tracking-[0.35em] text-white/50">
            VALÉRE HAVEN HOTEL & RESORT
          </p>

          <h2 className="mt-6 max-w-4xl text-5xl font-light leading-tight md:text-7xl">
            A stay designed around you.
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/60">
            Experience comfort, thoughtful service, and a relaxing
            atmosphere at Valére Haven.
          </p>

          <a
            href="/booking/availability"
            className="mt-9 inline-block bg-white px-7 py-4 text-sm font-medium text-[#1c1c1c]"
          >
            Check Availability
          </a>

        </div>

      </section>


      {/* Introduction */}
      <section className="px-6 py-24">

        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">

          <div>
            <p className="text-xs tracking-[0.3em] text-black/40">
              WELCOME
            </p>

            <h2 className="mt-5 text-4xl font-light leading-tight md:text-5xl">
              Comfort made simple.
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="leading-8 text-black/60">
              Valére Haven is designed to provide guests with a
              comfortable and memorable stay. From thoughtfully
              designed rooms to attentive guest services, every
              detail is created with your experience in mind.
            </p>
          </div>

        </div>

      </section>


      {/* Rooms */}
      <section className="border-y border-black/10 px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <p className="text-xs tracking-[0.3em] text-black/40">
            ACCOMMODATION
          </p>

          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <h2 className="max-w-2xl text-4xl font-light md:text-5xl">
              Rooms for every kind of stay.
            </h2>

            <a
              href="/rooms"
              className="text-sm underline underline-offset-4"
            >
              View all rooms
            </a>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Standard */}
            <a
              href="/rooms/standard"
              className="group border border-black/10 bg-white"
            >
              <div className="flex h-64 items-center justify-center bg-[#dedbd3]">
                <span className="text-xs tracking-[0.25em] text-black/40">
                  STANDARD ROOM
                </span>
              </div>

              <div className="p-7">

                <div className="flex justify-between gap-4">

                  <h3 className="text-2xl font-light">
                    Standard Room
                  </h3>

                  <span className="text-sm">
                    ₱3,500
                  </span>

                </div>

                <p className="mt-4 text-sm leading-6 text-black/50">
                  A comfortable room designed for a relaxing and
                  convenient stay.
                </p>

              </div>
            </a>


            {/* Superior */}
            <a
              href="/rooms/superior"
              className="group border border-black/10 bg-white"
            >
              <div className="flex h-64 items-center justify-center bg-[#d4d0c7]">
                <span className="text-xs tracking-[0.25em] text-black/40">
                  SUPERIOR ROOM
                </span>
              </div>

              <div className="p-7">

                <div className="flex justify-between gap-4">

                  <h3 className="text-2xl font-light">
                    Superior Room
                  </h3>

                  <span className="text-sm">
                    ₱4,500
                  </span>

                </div>

                <p className="mt-4 text-sm leading-6 text-black/50">
                  A spacious accommodation with additional space
                  for relaxation.
                </p>

              </div>
            </a>


            {/* Deluxe */}
            <a
              href="/rooms/deluxe"
              className="group border border-black/10 bg-white"
            >
              <div className="flex h-64 items-center justify-center bg-[#dedbd3]">
                <span className="text-xs tracking-[0.25em] text-black/40">
                  DELUXE ROOM
                </span>
              </div>

              <div className="p-7">

                <div className="flex justify-between gap-4">

                  <h3 className="text-2xl font-light">
                    Deluxe Room
                  </h3>

                  <span className="text-sm">
                    ₱6,000
                  </span>

                </div>

                <p className="mt-4 text-sm leading-6 text-black/50">
                  A refined room offering more space and premium
                  features.
                </p>

              </div>
            </a>

          </div>

        </div>

      </section>


      {/* Experience */}
      <section id="experience" className="px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <p className="text-xs tracking-[0.3em] text-black/40">
            EXPERIENCE
          </p>

          <h2 className="mt-5 max-w-3xl text-4xl font-light md:text-5xl">
            Everything you need for a comfortable stay.
          </h2>


          <div className="mt-14 grid gap-px bg-black/10 md:grid-cols-2 lg:grid-cols-4">

            <div className="bg-[#f8f6f1] p-8">
              <h3 className="text-xl font-light">
                Comfortable Rooms
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Thoughtfully arranged spaces designed for rest
                and relaxation.
              </p>
            </div>


            <div className="bg-[#f8f6f1] p-8">
              <h3 className="text-xl font-light">
                Dining
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Enjoy convenient dining options during your stay.
              </p>
            </div>


            <div className="bg-[#f8f6f1] p-8">
              <h3 className="text-xl font-light">
                Pool & Recreation
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Take time to relax, unwind, and enjoy recreational
                activities.
              </p>
            </div>


            <div className="bg-[#f8f6f1] p-8">
              <h3 className="text-xl font-light">
                Guest Services
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Friendly assistance to help make your stay easier
                and more comfortable.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* About */}
      <section id="about" className="bg-[#252525] px-6 py-24 text-white">

        <div className="mx-auto max-w-7xl">

          <p className="text-xs tracking-[0.3em] text-white/40">
            ABOUT VALÉRE HAVEN
          </p>

          <h2 className="mt-5 max-w-3xl text-4xl font-light leading-tight md:text-5xl">
            A place to slow down, rest, and feel at home.
          </h2>

          <p className="mt-7 max-w-2xl leading-8 text-white/60">
            Valére Haven combines comfortable accommodations,
            thoughtful spaces, and welcoming service to create a
            pleasant experience for every guest.
          </p>

        </div>

      </section>


      {/* Booking CTA */}
      <section className="px-6 py-24 text-center">

        <p className="text-xs tracking-[0.3em] text-black/40">
          PLAN YOUR STAY
        </p>

        <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-light md:text-5xl">
          Your comfortable stay starts here.
        </h2>

        <a
          href="/booking/availability"
          className="mt-9 inline-block bg-[#1c1c1c] px-7 py-4 text-sm text-white"
        >
          Book Your Stay
        </a>

      </section>


      {/* Footer */}
      <footer id="contact" className="border-t border-black/10 px-6 py-12">

        <div className="mx-auto max-w-7xl">

          <h3 className="font-semibold tracking-[0.2em]">
            Valére Haven
          </h3>

          <p className="mt-2 text-sm text-black/50">
            Hotel & Resort
          </p>

          <div className="mt-8 flex flex-col gap-2 text-sm text-black/50 md:flex-row md:gap-8">

            <span>
              reservations@valerehaven.com
            </span>

            <span>
              +63 900 000 0000
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}