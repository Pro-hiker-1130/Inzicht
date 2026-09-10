'use client';

import { useEffect, useState } from 'react';

function todayIsoDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatTime(localIso) {
  // Timestamps are already stored as the practice's local time, so no
  // timezone conversion is needed to display them — just read HH:MM
  // straight out of the string.
  return localIso.slice(11, 16);
}

// Picks a date, fetches that day's open slots from the API, and lets the
// visitor click one. Selection is lifted to the parent via props rather than
// handled here, so this component doesn't need to know anything about
// submitting a booking.
export default function SlotPicker({ selectedSlot, onSelectSlot, refreshToken = 0 }) {
  const [date, setDate] = useState(todayIsoDate());
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetch(`/api/availability?date=${date}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // refreshToken has no meaning of its own — bumping it from the parent
    // (after a successful booking, or a 409 conflict) just forces a refetch
    // so the slot list reflects reality again.
  }, [date, refreshToken]);

  return (
    <div className="slot-picker">
      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            onSelectSlot(null);
          }}
        />
      </label>

      {status === 'loading' && <p>Loading available times…</p>}
      {status === 'error' && <p>Couldn&rsquo;t load availability. Please try again.</p>}
      {status === 'ready' && slots.length === 0 && <p>No open times on this date.</p>}

      <div className="slot-grid">
        {slots.map((slot) => (
          <button
            key={slot.start_at}
            type="button"
            className={slot.start_at === selectedSlot?.start_at ? 'slot selected' : 'slot'}
            onClick={() => onSelectSlot(slot)}
          >
            {formatTime(slot.start_at)}
          </button>
        ))}
      </div>
    </div>
  );
}
