export interface InitializePaymentParams {
  email: string;
  amount: number; // in Naira (will be converted to kobo)
  donorName: string;
  phone?: string;
  centerId: string;
  category: string;
  callbackUrl?: string;
}

export async function initializePaystackPayment({
  email,
  amount,
  donorName,
  phone,
  centerId,
  category,
  callbackUrl,
}: InitializePaymentParams) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = "https://api.paystack.co";

  const amountInKobo = Math.round(amount * 100);
  const reference = `TBMI_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Simulated fallback if secret key is not set
  if (!secretKey) {
    console.log(`[PAYSTACK SIMULATION] Initializing payment of NGN ${amount} for ${donorName} (${email})`);
    return {
      success: true,
      simulated: true,
      authorization_url: `/give/receipt?reference=${reference}&simulated=true&amount=${amount}&category=${encodeURIComponent(
        category
      )}&donorName=${encodeURIComponent(donorName)}&centerId=${centerId}`,
      access_code: `mock_code_${reference}`,
      reference,
    };
  }

  try {
    const res = await fetch(`${baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        callback_url: callbackUrl,
        metadata: {
          donorName,
          phone,
          centerId,
          category,
          custom_fields: [
            { display_name: "Donor Name", variable_name: "donor_name", value: donorName },
            { display_name: "Giving Category", variable_name: "category", value: category },
            { display_name: "Center ID", variable_name: "center_id", value: centerId },
          ],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      return {
        success: false,
        error: data.message || "Failed to initialize Paystack transaction.",
      };
    }

    return {
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    };
  } catch (error: any) {
    console.error("Paystack Init Error:", error);
    return {
      success: false,
      error: error.message || "Network error connecting to Paystack.",
    };
  }
}

export async function verifyPaystackPayment(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = "https://api.paystack.co";

  // If in simulated mode (e.g. reference starts with TBMI_ and no key set)
  if (!secretKey) {
    return {
      success: true,
      simulated: true,
      status: "success",
      amount: 5000,
      currency: "NGN",
      reference,
      paidAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(`${baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      return {
        success: false,
        error: data.message || "Transaction verification failed.",
      };
    }

    const tx = data.data;
    return {
      success: tx.status === "success",
      status: tx.status,
      amount: tx.amount / 100, // back to Naira
      currency: tx.currency,
      reference: tx.reference,
      paidAt: tx.paid_at,
      channel: tx.channel,
      metadata: tx.metadata,
      customer: tx.customer,
    };
  } catch (error: any) {
    console.error("Paystack Verify Error:", error);
    return {
      success: false,
      error: error.message || "Failed to verify transaction.",
    };
  }
}
