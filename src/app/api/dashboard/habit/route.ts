import { supabase } from "@/untils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { UpdateHabitRequestBody } from "@/app/_types/Habit/UpdateRequestBody";
import { DeleteHabitRequestBody } from "@/app/_types/Habit/DeleteRequest";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  const token = request.headers.get("Authorization") ?? "";

  // supabaseに対してtokenを送る
  const { data, error } = await supabase.auth.getUser(token);

  // 送ったtokenが正しくない場合、errorが返却されるので、クライアントにもエラーを返す
  if (error) {
    console.error("Supabase error:", error.message);
    return NextResponse.json(
      {
        status: "error",
        message: "認証トークンが無効です。再ログインしてください。",
      },
      { status: 403 }
    );
  }

  // tokenが正しい場合、以降が実行される
  try {
    // ユーザーIDを使用して習慣をDBから取得
    const userId = data.user?.id;
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
  try {
    // リクエストのbodyを取得
    const { userId, name, supplementaryDescription }: UpdateHabitRequestBody =
      await request.json();

    // userIdを使用してデータベースを更新
    const updatedHabit = await prisma.habit.update({
      where: { userId }, // 一意の識別子を使用する
      data: {
        name,
        supplementaryDescription,
      },
    });

    // 成功時又はエラー時のレスポンスを返す
    return NextResponse.json({ status: "OK", updatedHabit }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ status: error.message }, { status: 400 });
    }
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const { userId }: DeleteHabitRequestBody = await request.json();

    // userIdを指定して、habitを削除
    await prisma.habit.delete({
      where: { userId },
    });

    // 成功時又はエラー時のレスポンスを返す
    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ status: error.message }, { status: 400 });
  }
};
