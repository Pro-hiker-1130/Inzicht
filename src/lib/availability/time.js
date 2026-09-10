// Naive-local-time arithmetic for the 'YYYY-MM-DDTHH:MM:SS' timestamps this
// project stores. Deliberately does NOT use `new Date(str)` on one of these
// strings: that constructor interprets an offset-less string as the *server
// machine's own local timezone*, which has nothing to do with the practice's
// timezone (Europe/Brussels) and would silently break if this code ever ran
// on a server set to a different zone. Instead the Y-M-D-H-M-S components
// are parsed as plain numbers, and Date.UTC()/getUTC*() is used purely as a
// calendar calculator (leap years, days-in-month, month/day rollover) —
// never as a real UTC timestamp.
function addMinutes(localIso, minutes) {
  const match = localIso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(`Expected 'YYYY-MM-DDTHH:MM:SS', got: ${localIso}`);
  }
  const [, y, mo, d, h, mi, s] = match.map(Number);
  const asCalendarUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  const shifted = new Date(asCalendarUtc + minutes * 60_000);

  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}` +
    `T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`
  );
}

module.exports = { addMinutes };
