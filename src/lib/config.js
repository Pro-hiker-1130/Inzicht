// Single practice timezone, phase 1 only: all timestamps in the database are
// naive local time in this zone (no UTC offset stored, no conversion done).
// Named as an IANA zone (not "UTC+1") because Antwerp observes DST
// (CET/UTC+1 in winter, CEST/UTC+2 in summer) — this constant is where that
// distinction would start to matter if multi-timezone support is ever added.
const PRACTICE_TIMEZONE = 'Europe/Brussels';

module.exports = { PRACTICE_TIMEZONE };
