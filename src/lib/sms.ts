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
  const formattedNumber = formatNigerianPhoneNumber(to);

  // Check which provider is configured
  const provider = (process.env.SMS_PROVIDER || "").toLowerCase();

  // 1. SMSLive247 Configuration
  const isSmsLive247 =
    provider === "smslive247" ||
    !!process.env.SMSLIVE247_SUBACCT ||
    !!process.env.SMSLIVE247_API_KEY;

  if (isSmsLive247) {
    return sendViaSmsLive247({ to: formattedNumber, message });
  }

  // 2. Termii Configuration
  const termiiApiKey = process.env.TERMII_API_KEY;
  if (termiiApiKey) {
    return sendViaTermii({ to: formattedNumber, message });
  }

  // 3. Fallback: Simulation Mode
  const defaultSender =
    process.env.SMS_SENDER_ID ||
    process.env.TERMII_SENDER_ID ||
    process.env.SMSLIVE247_SENDER_ID ||
    "TBMI";

  console.log(`[SMS SIMULATION] Provider: None (Simulated) | To: ${formattedNumber} | Sender: ${defaultSender}`);
  console.log(`[SMS CONTENT] ${message}`);
  return {
    success: true,
    simulated: true,
    message: "SMS simulated (Add your SMSLive247 or Termii credentials in .env to dispatch live SMS).",
    recipient: formattedNumber,
  };
}

/**
 * SMSLive247 Dispatch Engine
 * Supports Sub-Account HTTP API or API Token / Session
 */
async function sendViaSmsLive247({ to, message }: SendSMSOptions) {
  const sender = process.env.SMSLIVE247_SENDER_ID || "TBMI";
  const subacct = process.env.SMSLIVE247_SUBACCT;
  const subacctPwd = process.env.SMSLIVE247_SUBACCT_PASSWORD;
  const ownerEmail = process.env.SMSLIVE247_OWNER_EMAIL;
  const apiKey = process.env.SMSLIVE247_API_KEY;

  try {
    // Standard SMSLive247 HTTP Gateway URL
    const baseUrl = "https://www.smslive247.com/http/index.aspx";
    const params = new URLSearchParams();
    params.set("cmd", "sendmsg");
    params.set("sendto", to);
    params.set("sender", sender);
    params.set("message", message);
    params.set("msgtype", "0");

    if (subacct && subacctPwd) {
      params.set("subacct", subacct);
      params.set("subacctpwd", subacctPwd);
      if (ownerEmail) params.set("owneremail", ownerEmail);
    } else if (apiKey) {
      params.set("sessionid", apiKey);
    }

    const res = await fetch(`${baseUrl}?${params.toString()}`, {
      method: "GET",
    });

    const text = await res.text();

    if (text.startsWith("OK:")) {
      const messageId = text.replace("OK:", "").trim();
      return {
        success: true,
        provider: "SMSLive247",
        messageId,
        message: "SMS sent successfully via SMSLive247.",
      };
    } else {
      console.error("SMSLive247 Error Response:", text);
      return {
        success: false,
        provider: "SMSLive247",
        error: text || "Failed to deliver SMS through SMSLive247.",
      };
    }
  } catch (error: any) {
    console.error("SMSLive247 Dispatch Exception:", error);
    return {
      success: false,
      provider: "SMSLive247",
      error: error.message || "Network error connecting to SMSLive247 API.",
    };
  }
}

/**
 * Termii Dispatch Engine
 */
async function sendViaTermii({ to, message }: SendSMSOptions) {
  const apiKey = process.env.TERMII_API_KEY!;
  const senderId = process.env.TERMII_SENDER_ID || "TBMI";
  const baseUrl = process.env.TERMII_URL || "https://api.ng.termii.com";

  try {
    const payload = {
      to,
      from: senderId,
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: apiKey,
    };

    const res = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.code !== "ok") {
      console.error("Termii API error:", data);
      return {
        success: false,
        provider: "Termii",
        error: data.message || "Failed to deliver SMS through Termii.",
      };
    }

    return {
      success: true,
      provider: "Termii",
      messageId: data.message_id,
      data,
    };
  } catch (error: any) {
    console.error("Termii Dispatch Exception:", error);
    return {
      success: false,
      provider: "Termii",
      error: error.message || "Network error connecting to Termii API.",
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
