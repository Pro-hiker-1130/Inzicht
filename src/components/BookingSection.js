'use client';

import { useState } from 'react';
import SlotPicker from './SlotPicker';

// The booking form (name/email/reason + submit) lands in the next slice.
// For now this just proves the picker and the availability API are wired
// together correctly.
export default function BookingSection() {
  const [selectedSlot, setSelectedSlot] = useState(null);

  return (
    <section className="booking-section">
      <h2>Book a consultation</h2>
      <SlotPicker selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
      {selectedSlot && (
        <p>
          Selected: {selectedSlot.start_at.slice(0, 10)} at {selectedSlot.start_at.slice(11, 16)}.
          The booking form is coming in the next slice.
        </p>
      )}
    </section>
  );
}
