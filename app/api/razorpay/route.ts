import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "USD" } = body;

    const options = {
      amount: amount * 100, // Amount in smallest unit (e.g., cents or paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error("Razorpay error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
