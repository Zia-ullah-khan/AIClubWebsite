import NavBar from "./components/navbar";
import Footer from "./components/footer";
// Get API base URL from env for server-side rendering. Fallback to production.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aiapi.rfas.software';


export default async function Home() {
  const CLUB_DATA = await fetch(`${API_URL}/api/club-data`).then(res => res.json());

  return (
    <div className="min-h-screen bg-[#0F0F19] text-white font-sans">
      <NavBar />
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="relative z-10 p-8 sm:p-14 max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="text-[#875FFF]">Innovate. Create.</span> <span className="text-white">Lead with AI.</span>
            </h1>
            <p className="text-lg sm:text-2xl text-gray-300 mt-4">
              Your future, powered by AI literacy.
            </p>
            <div className="mt-8">
              <a href="/events" className="inline-block bg-[#875FFF] hover:bg-[#6e46cc] text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98]">
                Join the Club
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6 text-[#875FFF]">Our Mission & Value</h2>
          <div className="bg-[#1a1a2e] p-8 rounded-xl shadow-xl border border-[#875FFF]/30">
            <p className="text-lg text-gray-300 mb-8">{CLUB_DATA.mission}</p>
            <div className="grid sm:grid-cols-3 gap-6">
              {CLUB_DATA.whyJoin.map((item: { title: string; detail: string }, idx: number) => (
                <div key={idx} className="bg-[#0f0f19] p-4 rounded-lg border border-gray-700 hover:border-[#875FFF] transition">
                  <h3 className="text-xl font-semibold mb-2 text-[#875FFF]">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <h2 className="text-3xl font-bold mb-6 text-[#875FFF]">Upcoming Events</h2>
          <div className="space-y-4">
            {CLUB_DATA.upcomingEvents && CLUB_DATA.upcomingEvents.length > 0 ? (
              <>
                {CLUB_DATA.upcomingEvents.map((event: { id?: string; date: string; title: string }, idx: number) => (
                  <a key={event.id ?? idx} href={`/events?id=${event.id}`} className="block bg-[#1a1a2e] p-4 rounded-xl shadow-lg hover:bg-[#2c2c47] transition border-l-4 border-[#875FFF]">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-400">{event.date}</span>
                      <span className="text-xs font-bold text-green-400 bg-green-400/20 px-2 py-1 rounded">Upcoming</span>
                    </div>
                    <p className="text-lg font-medium mt-1">{event.title}</p>
                  </a>
                ))}
                <a href="/events" className="inline-block bg-[#875FFF] hover:bg-[#6e46cc] text-white font-semibold py-2.5 px-5 rounded-lg">
                  View All Events
                </a>
              </>
            ) : (
              <div className="bg-[#1a1a2e] p-4 rounded-xl border border-gray-700 text-gray-400">
                <p>No upcoming events at this time.</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  );
}
