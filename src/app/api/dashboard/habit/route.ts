import { supabase } from "@/untils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { UpdateHabitRequestBody } from "@/app/_types/Habit/UpdateRequestBody";
import { DeleteHabitRequestBody } from "@/app/_types/Habit/DeleteRequest";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  const token = request.headers.get("Authorization") ?? "";

  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "トークンが提供されていません。",
      },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 401 }
      );
    }

    const userId = data.user?.id;
    const habit = await prisma.habit.findUnique({
      where: { userId },
    });

    return NextResponse.json({ status: "OK", habit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching habit:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        status: "error",
        message: "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
  const token = request.headers.get("Authorization") ?? "";
  const body: UpdateHabitRequestBody = await request.json();

  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "トークンが提供されていません。",
      },
      { status: 401 }
    );
  }

  try {
    // トークン（認証情報）からユーザー情報を取得
    const { data: userData, error: authError } = await supabase.auth.getUser(
      token
    );

    // 認証エラーがある場合の処理
    if (authError) {
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 401 }
      );
    }

    // リクエストボディから習慣の名前と補足説明を取得
    const { name, supplementaryDescription } = body;

    //この条件が真であれば、習慣の名前が正しく入力されていないと判断。
    //trim()メソッド:文字列の前後の空白を取り除く
    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          status: "error",
          message: "習慣の名前は必須です。",
        },
        { status: 400 }
      );
    }

    const userId = userData.user.id;

    // 既存のhabitを更新
    const updatedHabit = await prisma.habit.update({
      where: { userId },
      data: {
        name: name.trim(),
        supplementaryDescription: supplementaryDescription?.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        status: "OK",
        habit: updatedHabit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating habit:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        status: "error",
        message: "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: NextRequest) => {
  const token = request.headers.get("Authorization") ?? "";
  const body: DeleteHabitRequestBody = await request.json();

  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "トークンが提供されていません。",
      },
      { status: 401 }
    );
  }

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser(
      token
    );

    if (authError) {
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 401 }
      );
    }
    // リクエストボディからhabitIdを取得
    const { habitId } = body;

    // ユーザーのhabitを削除
    await prisma.habit.delete({
      where: { id: habitId, userId: userData.user.id },
    });

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting habit:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        status: "error",
        message: "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
};
