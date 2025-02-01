import { supabase } from "@/untils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { UpdateHabitRequestBody } from "@/app/_types/Habit/UpdateRequestBody";
import { DeleteHabitRequestBody } from "@/app/_types/Habit/DeleteRequest";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
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
          message: "認証トークンが無効です。再度ログインしてください。",
        },
        { status: 401 }
      );
    }

    // userIdを使用して習慣をDBから取得
    const userId = data.user?.id; // ユーザーIDを取得
    const habit = await prisma.habit.findMany({
      where: { userId }, // ユーザーIDでフィルタリング
    });

    // レスポンスを返す
    return NextResponse.json({ status: "OK", habit }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ status: error.message }, { status: 400 });
    }
  }
};

export const PUT = async (request: NextRequest) => {
  const body: UpdateHabitRequestBody = await request.json();

  try {
    // リクエストのbodyを取得
    const { habitId, name, supplementaryDescription }: UpdateHabitRequestBody =
      body;

    // リクエストのbodyをログに出力（デバッグ用）
    console.log("Parsed Request Body:", {
      habitId,
      name,
      supplementaryDescription,
    });

    if (!habitId) {
      return NextResponse.json(
        { status: "error", message: "habitIdが提供されていません。" },
        { status: 400 }
      );
    }

    // データベースで既に登録されているか確認
    const existingHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!existingHabit) {
      return NextResponse.json(
        { status: "error", message: "指定された習慣が存在しません。" },
        { status: 404 }
      );
    }

    // habitIdを使用してデータベースを更新
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId }, // 一意の識別子を使用する
      data: {
        name,
        supplementaryDescription,
      },
    });

    // 成功時又はエラー時のレスポンスを返す
    return NextResponse.json({ status: "OK", updatedHabit }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating habit:", error.message);
      return NextResponse.json({ status: error.message }, { status: 400 });
    }
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const { habitId }: DeleteHabitRequestBody = await request.json();

    // userIdを指定して、habitを削除
    await prisma.habit.delete({
      where: { id: habitId },
    });

    // 成功時又はエラー時のレスポンスを返す
    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ status: error.message }, { status: 400 });
  }
};
