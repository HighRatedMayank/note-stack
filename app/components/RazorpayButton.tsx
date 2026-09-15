"use client";

import { useState } from "react";
import Button from "./ui/Button";

interface RazorpayButtonProps {
  amount: number;
  currency?: string;
  planName?: string;
}

export default function RazorpayButton({ amount, currency = "USD", planName = "Pro Plan" }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // Create order
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });

      const order = await response.json();

      if (order.error) {
        alert(order.error);
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
        amount: order.amount,
        currency: order.currency,
        name: "Note Stack",
        description: `Payment for ${planName}`,
        order_id: order.id,
        handler: function (response: Record<string, string>) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // You can also verify the payment here by calling another API route
        },
        prefill: {
          name: "John Doe",
          email: "john.doe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay;
      const paymentObject = new RazorpayConstructor(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="primary" size="md" onClick={handlePayment} disabled={loading}>
      {loading ? "Processing..." : `Upgrade to ${planName}`}
    </Button>
  );
}
