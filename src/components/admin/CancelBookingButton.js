'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelBookingButton({ bookingId }) {
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | working

  async function handleCancel() {
    if (!confirm('Cancel this booking?')) return;
    setStatus('working');

    const response = await fetch('/api/admin/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bookingId }),
    });

    if (response.ok) {
      router.refresh(); // re-run the admin page's server-side data fetch
    } else {
      setStatus('idle');
      alert('Could not cancel this booking.');
    }
  }

  return (
    <button type="button" onClick={handleCancel} disabled={status === 'working'}>
      {status === 'working' ? 'Cancelling…' : 'Cancel'}
    </button>
  );
}
