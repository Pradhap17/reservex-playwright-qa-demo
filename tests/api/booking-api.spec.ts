
import { test, expect } from '@playwright/test';

// Generate a unique key for each independent booking scenario.
// Reuse that key only when testing retries or duplicate submissions.
function createIdempotencyKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

test.describe('ReserveX demo booking API', () => {
  test('health endpoint reports demo service ready', async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(`${baseURL}/api/health`);

    expect(response.status()).toBe(200);
    await expect(response).toBeOK();

    expect(await response.json()).toMatchObject({
      status: 'ok',
      environment: 'demo',
    });
  });

  test('tour search returns structured inventory', async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(
      `${baseURL}/api/tours?destination=Colorado`
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: 'TOUR-101',
      price: 420,
      available: 8,
    });
  });

  test('booking computes subtotal and commission correctly', async ({
    request,
    baseURL,
  }) => {
    const key = createIdempotencyKey('booking-total');

    const response = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers: { 'Idempotency-Key': key },
        data: {
          tourId: 'TOUR-101',
          guests: 2,
          email: 'api.qa@example.com',
        },
      }
    );

    expect(response.status()).toBe(201);

    const booking = await response.json();

    expect(booking.bookingId).toMatch(/^RX-\d{5}$/);
    expect(booking.subtotal).toBe(840);
    expect(booking.commission).toBe(100.8);
    expect(booking.status).toBe('CONFIRMED');
  });

  test('rejects invalid guest counts', async ({
    request,
    baseURL,
  }) => {
    const key = createIdempotencyKey('invalid-guests');

    const response = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers: { 'Idempotency-Key': key },
        data: {
          tourId: 'TOUR-101',
          guests: 0,
          email: 'api.qa@example.com',
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toMatchObject({
      error: 'Guests must be an integer from 1 to 8',
    });
  });

  test('rejects sold-out inventory instead of confirming an impossible booking', async ({
    request,
    baseURL,
  }) => {
    const key = createIdempotencyKey('sold-out');

    const response = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers: { 'Idempotency-Key': key },
        data: {
          tourId: 'TOUR-303',
          guests: 1,
          email: 'api.qa@example.com',
        },
      }
    );

    expect(response.status()).toBe(409);

    expect(await response.json()).toMatchObject({
      error: 'Insufficient availability',
    });
  });

  test('simulated decline does not create a confirmed booking', async ({
    request,
    baseURL,
  }) => {
    const key = createIdempotencyKey('payment-decline');

    const response = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers: { 'Idempotency-Key': key },
        data: {
          tourId: 'TOUR-101',
          guests: 1,
          email: 'decline.qa@example.com',
          paymentScenario: 'decline',
        },
      }
    );

    expect(response.status()).toBe(402);

    expect(await response.json()).toMatchObject({
      error: 'Payment declined',
    });
  });

  test('duplicate booking submission with the same idempotency key returns the original booking', async ({
    request,
    baseURL,
  }) => {
    const key = createIdempotencyKey('duplicate-booking');

    const headers = { 'Idempotency-Key': key };

    const payload = {
      tourId: 'TOUR-101',
      guests: 1,
      email: 'duplicate.qa@example.com',
    };

    // First submission creates the booking.
    const first = await request.post(
      `${baseURL}/api/bookings`,
      { headers, data: payload }
    );

    expect(first.status()).toBe(201);

    const firstBooking = await first.json();

    // Repeating the identical request must not create another booking.
    const replay = await request.post(
      `${baseURL}/api/bookings`,
      { headers, data: payload }
    );

    expect(replay.status()).toBe(200);

    const replayBooking = await replay.json();

    expect(replayBooking.bookingId).toBe(firstBooking.bookingId);
    expect(replayBooking.idempotentReplay).toBe(true);
  });

  test('rejects reuse of an idempotency key with different booking data', async ({
    request,
    baseURL,
  }) => {
    const key = createIdempotencyKey('conflicting-booking');

    const headers = { 'Idempotency-Key': key };

    const first = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers,
        data: {
          tourId: 'TOUR-101',
          guests: 1,
          email: 'conflict.qa@example.com',
        },
      }
    );

    expect(first.status()).toBe(201);

    const conflict = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers,
        data: {
          tourId: 'TOUR-101',
          guests: 2,
          email: 'conflict.qa@example.com',
        },
      }
    );

    expect(conflict.status()).toBe(409);

    expect(await conflict.json()).toMatchObject({
      error:
        'Idempotency key was already used with a different booking request',
    });
  });

  test('allows safe retry after a declined payment using the same idempotency key', async ({
    request,
    baseURL,
  }) => {
    // IMPORTANT: all requests in this retry scenario share one key.
    const key = createIdempotencyKey('payment-retry');

    const headers = { 'Idempotency-Key': key };

    const payload = {
      tourId: 'TOUR-101',
      guests: 1,
      email: 'retry.qa@example.com',
    };

    // Attempt 1: payment is declined.
    const declined = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers,
        data: {
          ...payload,
          paymentScenario: 'decline',
        },
      }
    );

    expect(declined.status()).toBe(402);

    // Attempt 2: retry with the same key after the decline.
    const retry = await request.post(
      `${baseURL}/api/bookings`,
      { headers, data: payload }
    );

    expect(retry.status()).toBe(201);

    const successfulBooking = await retry.json();

    expect(successfulBooking.status).toBe('CONFIRMED');
    expect(successfulBooking.bookingId).toMatch(/^RX-\d{5}$/);

    // Attempt 3: another identical request must return the same booking.
    const replay = await request.post(
      `${baseURL}/api/bookings`,
      { headers, data: payload }
    );

    expect(replay.status()).toBe(200);

    const replayBooking = await replay.json();

    expect(replayBooking.bookingId).toBe(
      successfulBooking.bookingId
    );

    expect(replayBooking.idempotentReplay).toBe(true);
  });

  test('requires an idempotency key for booking creation', async ({
    request,
    baseURL,
  }) => {
    const response = await request.post(
      `${baseURL}/api/bookings`,
      {
        data: {
          tourId: 'TOUR-101',
          guests: 1,
          email: 'missing-key@example.com',
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toMatchObject({
      error: 'A valid Idempotency-Key header is required',
    });
  });

  test('cancellation and refund state transitions are validated', async ({
    request,
    baseURL,
  }) => {
    const key = createIdempotencyKey('refund-booking');

    const created = await request.post(
      `${baseURL}/api/bookings`,
      {
        headers: { 'Idempotency-Key': key },
        data: {
          tourId: 'TOUR-202',
          guests: 1,
          email: 'refund.qa@example.com',
        },
      }
    );

    expect(created.status()).toBe(201);

    const { bookingId } = await created.json();

    // Refund must not be processed before cancellation.
    const refundTooEarly = await request.post(
      `${baseURL}/api/bookings/${bookingId}/refund`
    );

    expect(refundTooEarly.status()).toBe(409);

    // Cancel the booking.
    const cancelled = await request.post(
      `${baseURL}/api/bookings/${bookingId}/cancel`
    );

    expect(cancelled.status()).toBe(200);

    expect(await cancelled.json()).toMatchObject({
      status: 'CANCELLED',
      refundStatus: 'PENDING',
    });

    // Complete the refund.
    const refunded = await request.post(
      `${baseURL}/api/bookings/${bookingId}/refund`
    );

    expect(refunded.status()).toBe(200);

    expect(await refunded.json()).toMatchObject({
      status: 'CANCELLED',
      refundStatus: 'REFUNDED',
    });
  });
});
