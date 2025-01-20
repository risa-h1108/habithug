import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { CreateHabitRequestBody } from "@/app/_types/Habit/PostRequest";
import { supabase } from "@/untils/supabase";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  let token = request.headers.get("Authorization") ?? "";
  console.log(token);

  // Supabaseに対してtokenを送る
  let { data, error } = await supabase.auth.getUser(token);
  console.log(data);
  console.log(error);

  // トークンが無効または期限切れの場合、トークンをリフレッシュ
  if (error?.status === 403) {
    const refreshResponse = await supabase.auth.refreshSession();

    if (refreshResponse.error) {
      console.error("Error refreshing token:", refreshResponse.error.message);
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 403 }
      );
    }

    // 新しいトークンを取得して再度ユーザー情報を取得
    token = refreshResponse.data.session?.access_token ?? "";
    ({ data, error } = await supabase.auth.getUser(token));
    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
        },
        { status: 403 }
      );
    }
  }

  const userId = data.user?.id;
  const supabaseId = data.user?.id; // SupabaseのユーザーIDを取得
  console.log(userId);

  if (!userId || !supabaseId) {
    return NextResponse.json(
      {
        status: "error",
        message: "指定されたユーザーが存在しません。",
      },
      { status: 403 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
        supabaseId: supabaseId, // SupabaseのユーザーIDを渡す
      },
    });
  }

  try {
    const body: CreateHabitRequestBody = await request.json();
    console.log(body);

    const { supplementaryDescription, name } = body;

    // 1ユーザーにつき、1習慣のため、postmanなどの作業中に重複できないので気をつける
    await prisma.habit.create({
      data: {
        supplementaryDescription,
        name,
        userId,
      },
    });

    return NextResponse.json({
      status: "OK",
      message: "習慣が登録されました",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 400 }
      );
    }
  }
};
