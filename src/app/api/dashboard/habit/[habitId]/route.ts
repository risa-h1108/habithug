import { supabase } from "@/untils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { UpdateHabitRequestBody } from "@/app/_types/Habit/UpdateRequestBody";
import { DeleteHabitRequestBody } from "@/app/_types/Habit/DeleteRequest";

const prisma = new PrismaClient();

export const GET = async (
  request: NextRequest,
  { params }: { params: { habitId: string } }
) => {
  const { habitId } = params;
  const token = request.headers.get("Authorization") ?? "";
  console.log("Token:", token);

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
    // supabaseに対してtokenを送る
    const { data, error } = await supabase.auth.getUser(token);
    console.log("Supabase Data:", data);
    console.log("Supabase Error:", error);

    // 送ったtokenが正しくない場合、errorが返却されるので、クライアントにもエラーを返す
    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 401 }
      );
    }

    // userIdを使用して習慣をDBから取得
    const userId = data.user?.id; // ユーザーIDを取得
    const habit = await prisma.habit.findMany({
      where: { userId, id: habitId }, // userIdとhabitIdでフィルタリング
    });

    // レスポンスを返す
    return NextResponse.json({ status: "OK", habit }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ status: error.message }, { status: 400 });
    }
  }
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { habitId: string } }
) => {
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
    // supabaseでトークンの取得
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

    const { name, supplementaryDescription } = body;
    const { habitId } = params;

    // 入力値のバリデーション
    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          status: "error",
          message: "習慣の名前は必須です。",
        },
        { status: 400 }
      );
    }

    // データベースで既に習慣が登録されているか確認（ユーザーIDも確認）
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: userData.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json(
        {
          status: "error",
          message: "指定された習慣が存在しないか、ログイン情報がありません。",
        },
        { status: 404 }
      );
    }

    // habitIdとuserIdの両方を使用してデータベースを更新
    const updatedHabit = await prisma.habit.update({
      where: {
        id: habitId,
        userId: userData.user.id,
      },
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
    // supabaseでトークンの検証
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

    const { habitId }: DeleteHabitRequestBody = await request.json();

    // 削除前に存在確認とユーザー所有権チェック
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: userData.user?.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json(
        {
          status: "error",
          message: "指定された習慣が存在しないか、アクセス権限がありません。",
        },
        { status: 404 }
      );
    }

    // userIdも指定して、habitを削除
    await prisma.habit.delete({
      where: {
        id: habitId,
        userId: userData.user?.id,
      },
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
