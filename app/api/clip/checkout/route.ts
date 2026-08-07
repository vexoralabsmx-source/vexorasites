import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plan?: string;
      price?: number;
      email?: string;
      billingCycle?: "monthly" | "annual";
    };
    const plan = body.plan ?? "studio";
    const amount = body.price ?? (plan === "scale" ? 79 : 29);
    const email = body.email ?? "cliente@vexora.site";

    const secretKey = process.env.CLIP_SECRET_KEY || process.env.CLIP_API_KEY;
    const paymentLinkOverride = process.env.NEXT_PUBLIC_CLIP_PAYMENT_LINK;

    if (paymentLinkOverride) {
      return NextResponse.json({
        success: true,
        checkoutUrl: paymentLinkOverride,
        method: "clip_link",
      });
    }

    if (secretKey) {
      const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");
      const clipRes = await fetch("https://api.payclip.com/v2/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
          "x-api-key": secretKey,
        },
        body: JSON.stringify({
          amount: amount,
          currency: "MXN",
          purchase_description: `Vexora Sites - Plan ${plan.toUpperCase()}`,
          redirection_url: {
            success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=success&plan=${plan}`,
            error: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?payment=error`,
            default: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
          },
          metadata: {
            plan,
            customer_email: email,
          },
        }),
      });

      if (clipRes.ok) {
        const data = (await clipRes.json()) as {
          payment_request_url?: string;
          url?: string;
          id?: string;
        };
        const checkoutUrl =
          data.payment_request_url || data.url || `https://clip.mx/pay/${data.id}`;
        return NextResponse.json({
          success: true,
          checkoutUrl,
          method: "clip_api",
        });
      }
    }

    // Direct Clip payment flow simulation with Clip API token support
    const clipSimulatedUrl = `https://clip.mx/checkout?amount=${amount}&description=Plan+${encodeURIComponent(
      plan.toUpperCase()
    )}+Vexora+Sites&email=${encodeURIComponent(email)}`;
    return NextResponse.json({
      success: true,
      checkoutUrl: clipSimulatedUrl,
      method: "clip_direct",
      plan,
      amount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error procesando pago con Clip",
      },
      { status: 500 }
    );
  }
}
