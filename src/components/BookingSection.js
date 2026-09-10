'use client';

import { useState } from 'react';
import SlotPicker from './SlotPicker';
import BookingForm from './BookingForm';

export default function BookingSection() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  function handleBooked(booking) {
    setConfirmedBooking(booking);
    setSelectedSlot(null);
    setRefreshToken((n) => n + 1);
  }

  function handleConflict() {
    // Someone else booked this slot between it being shown and submitted.
    // Refresh the picker's slot list in the background, but deliberately
    // leave selectedSlot (and so the form, with its error message) mounted —
    // clearing it here would unmount BookingForm before its error had a
    // chance to render. The visitor picking a different slot is what
    // replaces the form.
    setRefreshToken((n) => n + 1);
  }

  if (confirmedBooking) {
    return (
      <section className="booking-section">
        <h2>You&rsquo;re booked</h2>
        <p>
          Confirmed for {confirmedBooking.start_at.slice(0, 10)} at{' '}
          {confirmedBooking.start_at.slice(11, 16)}. A confirmation has been sent to{' '}
          {confirmedBooking.client_email}.
        </p>
      </section>
    );
  }

  return (
    <section className="booking-section">
      <h2>Book a consultation</h2>
      <SlotPicker selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} refreshToken={refreshToken} />
      {selectedSlot && (
        <BookingForm slot={selectedSlot} onBooked={handleBooked} onConflict={handleConflict} />
      )}
    </section>
  );
}
