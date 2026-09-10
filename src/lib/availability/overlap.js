// Two ranges [aStart, aEnd) and [bStart, bEnd) overlap iff aStart < bEnd AND
// bStart < aEnd. This single condition covers every way two ranges can
// intersect (partial overlap, full containment either direction, identical
// ranges) without needing a separate case for each.
//
// Plain string comparison works here because every timestamp in this
// project is the same 'YYYY-MM-DDTHH:MM:SS' format, which sorts
// lexicographically in the same order as chronologically.
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

module.exports = { rangesOverlap };
