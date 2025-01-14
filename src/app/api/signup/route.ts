import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { CreateUserRequestBody } from "@/app/_types/User/PostRequest";

const prisma = new PrismaClient();

export const POST = async (request: Request) => {
  try {
    const body: CreateUserRequestBody = await request.json();

    const { supabaseId } = body;

    // Prismaでローカルデータベースに保存
    const userData = await prisma.user.create({
      data: {
        supabaseId,
      },
    });

    return NextResponse.json({
      status: "OK",
      message: "ユーザーが作成されました",
      user: userData,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ status: error.message }, { status: 400 });
    }
  }
};
