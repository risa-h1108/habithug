import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { CreateHabitRequestBody } from "@/app/_types/Habit/PostRequest";
import { supabase } from "@/untils/supabase";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  const token = request.headers.get("Authorization") ?? "";
  console.log(token);

  // Supabaseに対してtokenを送る
  const { data, error } = await supabase.auth.getUser(token);
  console.log(data);
  console.log(error);

  // トークンが無効または期限切れの場合、エラーを吐くように変更
  if (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "認証トークンが無効です。再ログインしてください。",
      },
      { status: 403 }
    );
  }

  const supabaseId = data.user?.id; // SupabaseのユーザーIDを取得
  console.log(supabaseId);

  if (!supabaseId) {
    return NextResponse.json(
      {
        status: "error",
        message: "指定されたユーザーが存在しません。",
      },
      { status: 403 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseId }, // Supabase IDで検索
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        supabaseId: supabaseId, // SupabaseのユーザーIDを渡す
      },
    });
  }

  try {
    const body: CreateHabitRequestBody = await request.json();
    console.log(body);

    const { supplementaryDescription, name } = body;

    // SupabaseIDが一致する習慣が存在しているか探す
    const supabaseIdMathingHabit = await prisma.habit.findMany({
      where: { userId: existingUser?.id }, // ユーザーIDで検索
    });

    //usrIdが一致する習慣が存在していたら（0よりも登録数があれば＝1つ以上登録されていれば）エラーをフロントに返す
    if (supabaseIdMathingHabit.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "1ユーザーにつき1つ習慣のみ登録可能です。",
        },
        { status: 409 }
      );
    }

    // 1ユーザーにつき、1習慣のため、postmanなどの作業中に重複できないので気をつける
    await prisma.habit.create({
      data: {
        supplementaryDescription,
        name,
        userId: existingUser?.id,
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
