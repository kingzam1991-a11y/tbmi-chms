import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      whatsapp,
      email,
      centerId,
      gender,
      dobDay,
      dobMonth,
      dobYear,
      residentialArea,
      occupation,
      maritalStatus,
      weddingAnniversary,
      department,
    } = body;

    if (!firstName || !lastName || !phone || !centerId || !gender || !residentialArea) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Clean phone numbers
    const cleanPhone = phone.trim();
    const cleanWhatsapp = (whatsapp || phone).trim();

    // Check if member already registered with this phone number
    const existingMember = await prisma.member.findFirst({
      where: {
        OR: [{ phone: cleanPhone }, { whatsapp: cleanWhatsapp }],
      },
    });

    let member;
    if (existingMember) {
      // Update existing record
      member = await prisma.member.update({
        where: { id: existingMember.id },
        data: {
          firstName,
          lastName,
          email: email || existingMember.email,
          centerId,
          gender,
          dobDay: dobDay ? parseInt(dobDay) : existingMember.dobDay,
          dobMonth: dobMonth ? parseInt(dobMonth) : existingMember.dobMonth,
          dobYear: dobYear ? parseInt(dobYear) : existingMember.dobYear,
          residentialArea,
          occupation: occupation || existingMember.occupation,
          maritalStatus: maritalStatus || existingMember.maritalStatus,
          weddingAnniversary: weddingAnniversary || existingMember.weddingAnniversary,
          department: department || existingMember.department,
        },
        include: { center: true },
      });
    } else {
      // Create new member
      member = await prisma.member.create({
        data: {
          firstName,
          lastName,
          phone: cleanPhone,
          whatsapp: cleanWhatsapp,
          email: email || null,
          centerId,
          gender,
          dobDay: dobDay ? parseInt(dobDay) : null,
          dobMonth: dobMonth ? parseInt(dobMonth) : null,
          dobYear: dobYear ? parseInt(dobYear) : null,
          residentialArea,
          occupation: occupation || null,
          maritalStatus: maritalStatus || "SINGLE",
          weddingAnniversary: weddingAnniversary || null,
          department: department || "None / Yet to join",
          joinedVia: "WHATSAPP_SELF_REGISTRATION",
        },
        include: { center: true },
      });
    }

    // Send automated welcome SMS via Termii (non-blocking)
    sendWelcomeSMS({
      firstName: member.firstName,
      phone: member.phone,
      centerName: member.center?.name,
    }).catch((err) => console.error("Welcome SMS dispatch failed:", err));

    return NextResponse.json({
      success: true,
      message: existingMember ? "Profile updated successfully!" : "Registration complete! Welcome to TBMI.",
      member,
    });
  } catch (error) {
    console.error("Error saving member onboarding:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
