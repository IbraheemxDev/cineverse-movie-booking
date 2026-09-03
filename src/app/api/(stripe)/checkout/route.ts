    import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const { showId, movieTitle, seats, totalAmount } = await req.json();

    if (!seats || seats.length === 0) {
      return NextResponse.json({ message: 'No seats selected' }, { status: 400 });
    }

    // Stripe Checkout Session generate karein
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/movies`,
      metadata: {
        userId: session.user.id,
        showId,
        seats: JSON.stringify(seats), // e.g. ["A1", "A2"]
      },
      line_items: [
        {
          price_data: {
            currency: 'usd', // ya 'pkr' agar stripe account support kare
            product_data: {
              name: movieTitle,
              description: `Seats: ${seats.join(', ')}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Stripe amount cents/paise mein leta hai
          },
          quantity: 1,
        },
      ],
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ message: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}