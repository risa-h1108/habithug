import { FormValues } from "@/app/_types/Contact/FormValues";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: Request) => {
  try {
    const body: FormValues = await request.json();
    const { name, email, message } = body;

    await prisma.inquiry.create({
      data: {
        name,
        email,
        message,
      },
    });

    return NextResponse.json({
      status: "OK",
      message: "お問い合わせが完了しました",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "NG", message: "エラーが発生しました" },
      { status: 500 }
    );
  }
};
