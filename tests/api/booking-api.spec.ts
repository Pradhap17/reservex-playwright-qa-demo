import { test, expect } from '@playwright/test';

test.describe('ReserveX demo booking API', () => {
  test('health endpoint reports demo service ready', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/health`);
    expect(response.status()).toBe(200);
    await expect(response).toBeOK();
    expect(await response.json()).toMatchObject({ status: 'ok', environment: 'demo' });
  });

  test('tour search returns structured inventory', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/tours?destination=Colorado`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ id: 'TOUR-101', price: 420, available: 8 });
  });

  test('booking computes subtotal and commission correctly', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/api/bookings`, {
      data: { tourId: 'TOUR-101', guests: 2, email: 'api.qa@example.com' }
    });
    expect(response.status()).toBe(201);
    const booking = await response.json();
    expect(booking.bookingId).toMatch(/^RX-\d{5}$/);
    expect(booking.subtotal).toBe(840);
    expect(booking.commission).toBe(100.8);
    expect(booking.status).toBe('CONFIRMED');
  });

  test('rejects invalid guest counts', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/api/bookings`, {
      data: { tourId: 'TOUR-101', guests: 0, email: 'api.qa@example.com' }
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'Guests must be an integer from 1 to 8' });
  });

  test('rejects sold-out inventory instead of confirming an impossible booking', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/api/bookings`, {
      data: { tourId: 'TOUR-303', guests: 1, email: 'api.qa@example.com' }
    });
    expect(response.status()).toBe(409);
    expect(await response.json()).toMatchObject({ error: 'Insufficient availability' });
  });

  test('simulated decline does not create a confirmed booking', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}/api/bookings`, {
      data: { tourId: 'TOUR-101', guests: 1, email: 'api.qa@example.com', paymentScenario: 'decline' }
    });
    expect(response.status()).toBe(402);
    expect(await response.json()).toMatchObject({ error: 'Payment declined' });
  });

  test('cancellation and refund state transitions are validated', async ({ request, baseURL }) => {
    const created = await request.post(`${baseURL}/api/bookings`, {
      data: { tourId: 'TOUR-202', guests: 1, email: 'refund.qa@example.com' }
    });
    expect(created.status()).toBe(201);
    const { bookingId } = await created.json();

    const refundTooEarly = await request.post(`${baseURL}/api/bookings/${bookingId}/refund`);
    expect(refundTooEarly.status()).toBe(409);

    const cancelled = await request.post(`${baseURL}/api/bookings/${bookingId}/cancel`);
    expect(cancelled.status()).toBe(200);
    expect(await cancelled.json()).toMatchObject({ status: 'CANCELLED', refundStatus: 'PENDING' });

    const refunded = await request.post(`${baseURL}/api/bookings/${bookingId}/refund`);
    expect(refunded.status()).toBe(200);
    expect(await refunded.json()).toMatchObject({ status: 'CANCELLED', refundStatus: 'REFUNDED' });
  });
});