export interface SendSMSOptions {
  to: string; // Nigerian phone number
  message: string;
}

export function formatNigerianPhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // If starts with +234
  if (cleaned.startsWith("+234")) {
    return cleaned.slice(1);
  }
  // If starts with 234
  if (cleaned.startsWith("234")) {
    return cleaned;
  }
  // If starts with 0
  if (cleaned.startsWith("0")) {
    return "234" + cleaned.slice(1);
  }

  return cleaned;
}

export async function sendSMS({ to, message }: SendSMSOptions) {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || "TBMI-OSOGBO";
  const baseUrl = process.env.TERMII_URL || "https://api.ng.termii.com";

  const formattedNumber = formatNigerianPhoneNumber(to);

  // If no API key is provided, run in simulated/demo mode
  if (!apiKey) {
    console.log(`[SMS SIMULATION] To: ${formattedNumber} | Sender: ${senderId}`);
    console.log(`[SMS CONTENT] ${message}`);
    return {
      success: true,
      simulated: true,
      message: "SMS simulated (add TERMII_API_KEY in .env to dispatch live SMS).",
      recipient: formattedNumber,
    };
  }

  try {
    const payload = {
      to: formattedNumber,
      from: senderId,
      sms: message,
      type: "plain",
      channel: "generic", // Termii generic channel supports DND and non-DND
      api_key: apiKey,
    };

    const res = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.code !== "ok") {
      console.error("Termii API error:", data);
      return {
        success: false,
        error: data.message || "Failed to deliver SMS through Termii.",
        data,
      };
    }

    return {
      success: true,
      messageId: data.message_id,
      data,
    };
  } catch (error: any) {
    console.error("Error dispatching SMS:", error);
    return {
      success: false,
      error: error.message || "Network error while connecting to Termii API.",
    };
  }
}

export async function sendWelcomeSMS(member: {
  firstName: string;
  phone: string;
  centerName?: string;
}) {
  const center = member.centerName || "TBMI Osogbo";
  const message = `Welcome to ${center}, ${member.firstName}! Your membership profile has been recorded. May God's blessing rest upon you and your household!`;
  return sendSMS({ to: member.phone, message });
}

export async function sendBirthdaySMS(member: {
  firstName: string;
  phone: string;
}) {
  const message = `Happy Birthday ${member.firstName}! The pastoral council and brethren of TBMI Osogbo pray for fresh grace, good health, and fruitfulness upon your life today!`;
  return sendSMS({ to: member.phone, message });
}
