// Stand-in for a real email provider — logs what would be sent instead of
// actually sending it. Swapping this for a real provider later (e.g.
// Postmark, SES) means replacing the body of this one function; nothing
// that calls it needs to change.
function sendConfirmationEmail(booking) {
  const dateLabel = booking.start_at.slice(0, 10);
  const timeLabel = booking.start_at.slice(11, 16);

  console.log('--- Confirmation email (stub, not actually sent) ---');
  console.log(`To: ${booking.client_email}`);
  console.log('Subject: Your consultation is confirmed');
  console.log(
    `Hi ${booking.client_name},\n\n` +
      `Your consultation is confirmed for ${dateLabel} at ${timeLabel} (Europe/Brussels time).\n\n` +
      'See you then.'
  );
  console.log('-----------------------------------------------------');
}

module.exports = { sendConfirmationEmail };
