import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const envPath = path.resolve(process.cwd(), ".env");

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      provider: process.env.SMS_PROVIDER || "smslive247",
      subacct: process.env.SMSLIVE247_SUBACCT || "",
      ownerEmail: process.env.SMSLIVE247_OWNER_EMAIL || "",
      senderId: process.env.SMSLIVE247_SENDER_ID || "TBMI",
      hasPassword: !!process.env.SMSLIVE247_SUBACCT_PASSWORD,
      hasApiKey: !!process.env.SMSLIVE247_API_KEY,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to read settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, subacct, password, ownerEmail, apiKey, senderId } = body;

    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const updates: Record<string, string> = {
      SMS_PROVIDER: provider || "smslive247",
      SMSLIVE247_SUBACCT: subacct || "",
      SMSLIVE247_OWNER_EMAIL: ownerEmail || "",
      SMSLIVE247_SENDER_ID: senderId || "TBMI",
    };

    if (password) {
      updates["SMSLIVE247_SUBACCT_PASSWORD"] = password;
    }
    if (apiKey) {
      updates["SMSLIVE247_API_KEY"] = apiKey;
    }

    // Update in process.env memory immediately
    for (const [key, value] of Object.entries(updates)) {
      process.env[key] = value;
    }

    // Update or append in .env file
    let lines = envContent.split(/\r\n|\n/);
    for (const [key, value] of Object.entries(updates)) {
      const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
      const formatted = `${key}="${value}"`;
      if (idx >= 0) {
        lines[idx] = formatted;
      } else {
        lines.push(formatted);
      }
    }

    fs.writeFileSync(envPath, lines.join("\n"), "utf-8");

    return NextResponse.json({
      success: true,
      message: "SMSLive247 credentials saved successfully!",
    });
  } catch (error: any) {
    console.error("Save SMS Settings Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update .env" },
      { status: 500 }
    );
  }
}
