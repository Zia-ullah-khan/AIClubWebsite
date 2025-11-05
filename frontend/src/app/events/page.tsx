const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type SearchParams = { id?: string };

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const id = searchParams?.id;

  if (!id) {
    return (
      <main className="min-h-[60vh] mx-auto max-w-5xl px-4 sm:px-6 py-12 text-white">
        <h1 className="text-3xl font-bold text-[#875FFF] mb-4">Events & Workshops</h1>
        <p className="text-gray-300">No event selected. Please choose an event from the home page.</p>
      </main>
    );
  }

  const res = await fetch(`${API_URL}/api/events/${id}`, { next: { revalidate: 30 } });
  if (!res.ok) {
    return (
      <main className="min-h-[60vh] mx-auto max-w-5xl px-4 sm:px-6 py-12 text-white">
        <h1 className="text-3xl font-bold text-[#875FFF] mb-4">Event Details</h1>
        <p className="text-red-400">Failed to load event. It may have been deleted or the link is invalid.</p>
      </main>
    );
  }
  const data = await res.json();
  const event = data.event;

  return (
    <main className="min-h-[60vh] mx-auto max-w-5xl px-4 sm:px-6 py-12 text-white">
      <h1 className="text-3xl font-bold text-[#875FFF] mb-2">{event.title}</h1>
      {event.date && (
        <p className="text-gray-400 mb-6">{event.date}</p>
      )}

      {event.description && (
        <p className="text-gray-200 mb-6 leading-relaxed">{event.description}</p>
      )}

      {event.details && (
        <div className="bg-[#1a1a2e] p-6 rounded-xl border border-[#875FFF]/30 space-y-2">
          {event.details.location && (
            <p><span className="text-gray-400">Location:</span> {event.details.location}</p>
          )}
          {event.details.time && (
            <p><span className="text-gray-400">Time:</span> {event.details.time}</p>
          )}
          {event.details.zoom && (
            <p><span className="text-gray-400">Zoom:</span> <a className="text-[#875FFF] underline" href={event.details.zoom}>Join link</a></p>
          )}
        </div>
      )}
    </main>
  );
}
