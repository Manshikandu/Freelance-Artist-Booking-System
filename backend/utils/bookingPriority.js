// utils/bookingPriority.js

export const statusWeights = {
  completed: 100,
  booked: 80,
  accepted: 60,
  pending: 30,
  rejected: 10,
  cancelled: 5,
};

export const contractWeights = {
  signed: 50,
  generated: 30,
  none: 0,
};

export function getRecencyWeight(timestamp) {
  const hoursAgo = (Date.now() - new Date(timestamp)) / (1000 * 60 * 60);
  return Math.max(0, 50 - hoursAgo); // Up to 50 for recent, 0 if older than 50 hours
}

export function calculateBookingScore(booking) {
  const statusScore = statusWeights[booking.status] || 0;
  const contractScore = contractWeights[booking.contractStatus || "none"] || 0;
  const recencyScore = getRecencyWeight(booking.lastActionTime || booking.updatedAt);
const finalScore = (
    0.5 * statusScore +
    0.3 * contractScore +
    0.2 * recencyScore
  );

  const clientName = booking.client?.username || booking.client?.name || 'Unknown Client';
  const artistName = booking.artist?.username || booking.artist?.name || 'Unknown Artist';

  console.log('=== Booking Score Calculation ===');
  console.log('Booking ID:', booking._id || booking.id || 'N/A');
  console.log('Client:', clientName);
  console.log('Artist:', artistName);
  console.log('Status:', booking.status, '| Score:', statusScore, '| Weighted:', 0.5 * statusScore);
  console.log('Contract Status:', booking.contractStatus || 'none', '| Score:', contractScore, '| Weighted:', 0.3 * contractScore);
  console.log('Recency Score:', recencyScore.toFixed(2), '| Weighted:', (0.2 * recencyScore).toFixed(2));
  console.log('Final Algorithm Score:', finalScore.toFixed(2));
  console.log('================================');

  return finalScore;


}


   