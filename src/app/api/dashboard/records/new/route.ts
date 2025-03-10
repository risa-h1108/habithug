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
    const userId = data.user.id;
    const body: CreateDiaryRequestBody = await request.json();
    const { date, checkOnly } = body;

    // 指定された日付の記録が存在するかチェック
    //同じ日の重複が1件見つかれば十分な為、findFirstにする
    const existingRecord = await prisma.diary.findFirst({
      where: {
        userId, // 特定ユーザーの記録のみ
        // 日付範囲の指定↓
        date: {
          // 日付の範囲を設定（0時から24時まで）
          //gte (Greater Than or Equal to)：以上（>=）
          //lt (Less Than)：未満（<）
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(24, 0, 0, 0)),
        },
        //補足↓
        //  gt (Greater Than)：より大きい（>）
        //lte (Less Than or Equal to):以下（<=）
      },
      // IDも取得して、編集ページへのリダイレクト用に使用
      select: {
        id: true, // IDフィールドのみを取得
      },
    });

    // checkOnly（true）フラグがある場合は存在チェックのみ
    if (checkOnly) {
      return NextResponse.json({
        exists: !!existingRecord, //[!!]: Boolean型に変換,existingRecordをBoolean型に変換
        recordId: existingRecord?.id, // 存在する場合のみ編集ページへのリダイレクト用にIDを含める
      });
    }

    // 記録が既に存在する場合は409エラー
    if (existingRecord) {
      return NextResponse.json(
        {
          message: "本日の記録は既に登録されています。",
          recordId: existingRecord.id, // 編集ページへのリダイレクト用にIDを含める
        },
        { status: 409 }
      );
    }

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
      // レスポンスに含めるフィールドを指定（必要なデータのみをフロントに返す）
      select: {
        id: true,
        date: true,
        reflection: true,
        additionalNotes: true,
        praises: {
          select: {
            praiseText: true,
          },
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
