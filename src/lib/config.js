// Single practice timezone, phase 1 only: all timestamps in the database are
// naive local time in this zone (no UTC offset stored, no conversion done).
// Named as an IANA zone (not "UTC+1") because Antwerp observes DST
// (CET/UTC+1 in winter, CEST/UTC+2 in summer) — this constant is where that
// distinction would start to matter if multi-timezone support is ever added.
const PRACTICE_TIMEZONE = 'Europe/Brussels';

// A single hardcoded admin password, per phase-1 scope — no user accounts,
// no hashing, no rate limiting, no CSRF protection on top of it. Overridable
// via env var so the real value (if any) isn't committed to git, but this is
// NOT secure enough for real client data — revisit before ever going live.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

// The cookie's value is just a fixed "yes, logged in" marker, not a real
// session token — consistent with the single-hardcoded-password scope above.
const ADMIN_SESSION_COOKIE = 'inzicht_admin_session';
const ADMIN_SESSION_VALUE = 'authenticated';

module.exports = {
  PRACTICE_TIMEZONE,
  ADMIN_PASSWORD,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
};
