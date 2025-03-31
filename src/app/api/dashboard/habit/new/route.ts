import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { CreateHabitRequestBody } from "@/app/_types/Habit/PostRequest";
import { authenticateUser } from "@/app/_components/Authentication";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  // 認証処理
  //authenticateUser関数にリクエストを渡して認証を実行
  const authResult = await authenticateUser(request);

  // NextResponseが返ってきた場合はエラー
  //(判定したいオブジェクト instanceof オブジェクト名称)：判定したいオブジェクトの種類が instanceof の後ろに記載したオブジェクト名称と一致する場合はtrue、不一致の場合はfalseを返却
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  //認証が成功した場合、authResultからユーザー情報を分割代入
  const { user } = authResult;

  const supabaseId = user.id; // SupabaseのユーザーIDを取得
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

  try {
    const existingUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseId }, // Supabase IDで検索
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "指定されたユーザーが存在しません。",
        },
        { status: 403 }
      );
    }

    const body: CreateHabitRequestBody = await request.json();
    console.log(body);

    const { supplementaryDescription, name } = body;

    // SupabaseIDが一致する習慣が存在しているか探す
    const supabaseIdMathingHabit = await prisma.habit.findMany({
      where: { userId: existingUser.id }, // ユーザーIDで検索
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
