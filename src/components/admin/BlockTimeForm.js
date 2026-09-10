'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BlockTimeForm() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    const response = await fetch('/api/admin/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: `${date}T${startTime}:00`,
        endAt: `${date}T${endTime}:00`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus('idle');
      setError(data.error || 'Something went wrong.');
      return;
    }

    setStatus('idle');
    setDate('');
    setStartTime('');
    setEndTime('');
    router.refresh();
  }

  return (
    <form className="block-time-form" onSubmit={handleSubmit}>
      <label>
        Date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
      </label>
      <label>
        From
        <input
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />
      </label>
      <label>
        To
        <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Blocking…' : 'Block this time'}
      </button>
    </form>
  );
}
