import { CreateDiaryRequestBody } from "@/app/_types/Diary/PostRequest";
import { supabase } from "@/_untils/supabase";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  const token = request.headers.get("Authorization");
  console.log(token);

  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "認証トークンがありません。再ログインしてください。",
      },
      { status: 403 }
    );
  }

  // Supabaseに対してtokenを送る
  const { data, error } = await supabase.auth.getUser(token);
  console.log(data);
  console.log(error);

  if (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "認証トークンが無効です。再ログインしてください。",
      },
      { status: 403 }
    );
  }

  try {
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
    const body: CreateDiaryRequestBody = await request.json();
    const { date } = body;

    // 新規登録処理
    const diary = await prisma.diary.create({
      data: {
        userId, // ユーザーID
        date: new Date(date), // 日付
        reflection: body.reflection!, //[!]:null又はundefinedではないことを保証（＝必須）、reflectionがない場合、実行時エラーが発生
        additionalNotes: body.additionalNotes || "", //任意のため、空文字が渡される可能性を加味。
        praises: {
          create: body.praises!.map((praise) => ({
            //praisesは必須（!の処理）&枠組みを複数作成できる（map処理）
            praiseText: praise.praiseText,
          })),
        },
      },
    });
    console.log(diary);

    return NextResponse.json({
      status: "OK",
      message: "毎日の記録が登録されました",
      data: diary, // 作成したデータを返す
    });
  } catch (error) {
    console.error("Error in diary creation:", error);
    return NextResponse.json(
      { message: "日記の作成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
};
