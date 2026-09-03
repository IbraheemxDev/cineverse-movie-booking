import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/dbConnect";
import { Booking } from "@/models/Booking";
import Show from "@/models/Show";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful checkout payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // Dono keys check kar rahe hain taake agar 'seats' ho ya 'selectedSeats', error na aaye
    const { userId, showId } = session.metadata || {};
    const seatsData = session.metadata?.seats || session.metadata?.selectedSeats;
    
    // Stripe amount_total cents mein deta hai, usko convert karein
    const paidAmount = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.totalAmount || 0);

    if (!seatsData || !userId || !showId) {
      console.error("Missing metadata in Stripe session:", session.metadata);
      return NextResponse.json({ error: "Incomplete metadata" }, { status: 400 });
    }

    const parsedSeats: string[] = JSON.parse(seatsData);

    await connectDB();

    try {
      // 1. Database mein Booking create karein
      const booking = await Booking.create({
        user: userId,
        show: showId,
        amount: paidAmount,
        bookedSeats: parsedSeats,
        paymentId: session.payment_intent || session.id,
        status: "confirmed",
      });

      // 2. Show find karke seats ko permanently occupied mark karein
      const showData = await Show.findById(showId);

      if (showData) {
        if (!showData.occupiedSeats) {
          showData.occupiedSeats = {};
        }

        parsedSeats.forEach((seat: string) => {
          if (showData.occupiedSeats instanceof Map || typeof showData.occupiedSeats.set === "function") {
            showData.occupiedSeats.set(seat, userId);
          } else {
            showData.occupiedSeats[seat] = userId;
          }
        });

        showData.markModified("occupiedSeats");
        await showData.save();
      }

      console.log(`Booking confirmed for User ${userId}, Booking ID: ${booking._id}`);
    } catch (dbError) {
      console.error("Error saving booking on webhook:", dbError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}