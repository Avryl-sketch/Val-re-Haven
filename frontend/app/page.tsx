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
    title: "Comfortable Rooms",
    text: "Thoughtfully arranged spaces designed for rest and relaxation.",
  },
  {
    title: "Dining",
    text: "Enjoy convenient dining options and a warm welcome during your stay.",
  },
  {
    title: "Pool & Recreation",
    text: "Take time to unwind and enjoy resort-style experiences by the pool.",
  },
  {
    title: "Guest Services",
    text: "Friendly assistance to make your stay easier, smoother, and more memorable.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#1f2d2b]">
      <header className="border-b border-[#1f2d2b]/10 bg-[#f7f2ea] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="group">
            <h1 className="text-xl font-semibold tracking-[0.2em] text-[#1b2f2c]">
              Valére Haven
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.32em] text-[#5d6d68]">
              HOTEL & RESORT
            </p>
          </a>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="/" className="font-medium text-[#1b2f2c]">
              Home
            </a>
            <a href="/rooms" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Rooms
            </a>
            <a href="#experience" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Experience
            </a>
            <a href="#about" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              About
            </a>
            <a href="#contact" className="text-[#3d4f4a] transition hover:text-[#1b2f2c]">
              Contact
            </a>
            <a
              href="/booking/availability"
              className="bg-[#163d36] px-5 py-3 text-sm text-[#f7f2ea] shadow-sm transition hover:bg-[#102923]"
            >
              Book Now
            </a>
          </nav>

          <a
            href="/booking/availability"
            className="bg-[#163d36] px-4 py-2 text-sm text-[#f7f2ea] md:hidden"
          >
            Book
          </a>
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
            <a
              href="/booking/availability"
              className="inline-block bg-[#f3d7a8] px-7 py-4 text-sm font-medium text-[#163d36] transition hover:bg-[#ebc88e]"
            >
              Check Availability
            </a>
            <a
              href="/rooms"
              className="inline-block border border-white/50 bg-white/5 px-7 py-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              View Rooms
            </a>
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
            <a href="/rooms" className="text-sm text-[#163d36] underline underline-offset-4">
              View all rooms
            </a>
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

      <section id="experience" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-[0.3em] text-[#5d6d68]">EXPERIENCE</p>
          <h2 className="mt-5 max-w-3xl text-4xl font-light text-[#163d36] md:text-5xl">
            Everything you need for a comfortable stay.
          </h2>

          <div className="mt-14 grid gap-px bg-[#1f2d2b]/10 md:grid-cols-2 lg:grid-cols-4">
            {experiences.map((item) => (
              <div key={item.title} className="bg-[#f7f2ea] p-8">
                <h3 className="text-xl font-light text-[#163d36]">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#5d6d68]">{item.text}</p>
              </div>
            ))}
          </div>
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

      <section className="px-6 py-24 text-center">
        <p className="text-xs tracking-[0.3em] text-[#5d6d68]">PLAN YOUR STAY</p>
        <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-light text-[#163d36] md:text-5xl">
          Your comfortable stay starts here.
        </h2>
        <a href="/booking/availability" className="mt-9 inline-block bg-[#163d36] px-7 py-4 text-sm text-[#f7f2ea] transition hover:bg-[#102923]">
          Book Your Stay
        </a>
      </section>

      <footer id="contact" className="border-t border-[#1f2d2b]/10 px-6 py-12">
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
