import { UpdateDiaryRequestBody } from "@/app/_types/Diary/UpdateRequest";
import { supabase } from "@/_untils/supabase";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  const token = request.headers.get("Authorization");

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

    // 送ったtokenが正しくない場合、errorが返却されるので、クライアントにもエラーを返す
    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 401 }
      );
    }

    // supabaseIdを使用してdiaryをDBから取得
    const supabaseId = data.user.id;

    // SupabaseのIDを使ってUserテーブルからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: {
        supabaseId: supabaseId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "ユーザーが見つかりません。",
        },
        { status: 404 }
      );
    }

    const userId = user.id;
    const body: UpdateDiaryRequestBody = await request.json();
    const { date, reflection, additionalNotes } = body;

    if (!date || !reflection) {
      return NextResponse.json(
        { message: "日付と振り返りのタイプは必須です。" },
        { status: 400 }
      );
    }

    //データの取得
    //複数の情報を取得し、その中から条件に合うものを選別するため、findUniqueではなく、findManyを使用。
    const diary = await prisma.diary.findMany({
      where: {
        userId,
        date: new Date(date),
        reflection: body.reflection,
        additionalNotes: additionalNotes || "",
      },
      include: {
        praises: true, // praisesを含めて取得
      },
    });

    return NextResponse.json({
      status: "OK",
      message: "毎日の記録が更新されました",
      data: diary, // 作成したデータを返す
    });
  } catch (error) {
    console.error("Error in diary updating:", error);
    return NextResponse.json(
      { message: "日記の更新中にエラーが発生しました。" },
      { status: 500 }
    );
  }
};
