import BookingSection from '../components/BookingSection';

// Placeholder hero copy — the real hero/about/services/FAQ content gets
// built out once the HTML/CSS reference is shared.
export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>Inzicht Therapy Practice</h1>
        <p>A calm, confidential space to talk. Book a free initial consultation below.</p>
      </section>

      <BookingSection />
    </main>
  );
}
