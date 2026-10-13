const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 4173);

const tours = [
  { id: 'TOUR-101', title: 'Rocky Mountain Explorer', destination: 'Colorado, USA', days: 3, price: 420, commissionRate: 0.12, available: 8 },
  { id: 'TOUR-202', title: 'Canyon Sunrise Adventure', destination: 'Utah, USA', days: 2, price: 280, commissionRate: 0.10, available: 5 },
  { id: 'TOUR-303', title: 'Alpine Lakes Expedition', destination: 'Canada', days: 5, price: 750, commissionRate: 0.15, available: 0 }
];
const bookings = new Map();

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}
function body(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); }
    });
  });
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST' });
    return res.end();
  }
  if (url.pathname === '/api/health') return json(res, 200, { status: 'ok', environment: 'demo' });
  if (url.pathname === '/api/tours' && req.method === 'GET') {
    const destination = (url.searchParams.get('destination') || '').toLowerCase();
    const results = tours.filter(t => !destination || t.destination.toLowerCase().includes(destination) || t.title.toLowerCase().includes(destination));
    return json(res, 200, { items: results });
  }
  if (url.pathname.startsWith('/api/tours/') && req.method === 'GET') {
    const tour = tours.find(t => t.id === url.pathname.split('/').pop());
    return tour ? json(res, 200, tour) : json(res, 404, { error: 'Tour not found' });
  }
  if (url.pathname === '/api/bookings' && req.method === 'POST') {
    let payload;
    try { payload = await body(req); } catch { return json(res, 400, { error: 'Invalid JSON' }); }
    const tour = tours.find(t => t.id === payload.tourId);
    if (!tour) return json(res, 404, { error: 'Tour not found' });
    const guests = Number(payload.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 8) return json(res, 400, { error: 'Guests must be an integer from 1 to 8' });
    if (tour.available < guests) return json(res, 409, { error: 'Insufficient availability' });
    if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) return json(res, 400, { error: 'Valid email is required' });
    // Demo-only payment simulation; never handles real payment data.
    if (payload.paymentScenario === 'decline') return json(res, 402, { error: 'Payment declined' });
    const bookingId = `RX-${String(bookings.size + 1).padStart(5, '0')}`;
    const subtotal = tour.price * guests;
    const commission = Math.round(subtotal * tour.commissionRate * 100) / 100;
    const booking = { bookingId, tourId: tour.id, guests, email: payload.email, subtotal, commission, status: 'CONFIRMED', refundStatus: 'NOT_REQUESTED' };
    bookings.set(bookingId, booking);
    return json(res, 201, booking);
  }
  const bookingMatch = url.pathname.match(/^\/api\/bookings\/([^/]+)(?:\/(cancel|refund))?$/);
  if (bookingMatch) {
    const [, id, action] = bookingMatch;
    const booking = bookings.get(id);
    if (!booking) return json(res, 404, { error: 'Booking not found' });
    if (req.method === 'GET' && !action) return json(res, 200, booking);
    if (req.method === 'POST' && action === 'cancel') {
      booking.status = 'CANCELLED';
      booking.refundStatus = 'PENDING';
      return json(res, 200, booking);
    }
    if (req.method === 'POST' && action === 'refund') {
      if (booking.status !== 'CANCELLED') return json(res, 409, { error: 'Booking must be cancelled before refund' });
      booking.refundStatus = 'REFUNDED';
      return json(res, 200, booking);
    }
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(path.join(root, 'index.html')).pipe(res);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});
server.listen(port, '127.0.0.1', () => console.log(`ReserveX demo running at http://127.0.0.1:${port}`));