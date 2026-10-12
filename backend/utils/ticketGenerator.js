const Counter = require('../models/Counter');

/**
 * Generates an atomic sequential ticket ID, e.g., CC-2026-00001
 */
async function generateTicketId() {
  const currentYear = new Date().getFullYear();
  const counterKey = `complaint_ticket_${currentYear}`;
  const seqNumber = await Counter.getNextSequence(counterKey);
  const padded = String(seqNumber).padStart(5, '0');
  return `CC-${currentYear}-${padded}`;
}

module.exports = { generateTicketId };
