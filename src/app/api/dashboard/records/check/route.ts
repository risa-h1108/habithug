import { supabase } from "@/_untils/supabase";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  const token = request.headers.get("Authorization");
  console.log("認証トークン:", token);

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
    console.error("認証エラー:", error);
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

    // URLからクエリパラメータを取得
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const checkOnly = url.searchParams.get("checkOnly") === "true";

    if (!dateParam) {
      return NextResponse.json(
        {
          status: "error",
          message: "日付が指定されていません。",
        },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    console.log("日付チェック:", date);

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

    console.log("既存レコード:", existingRecord);

    // checkOnlyフラグがある場合は存在チェックのみ
    if (checkOnly) {
      return NextResponse.json({
        status: "success",
        exists: !!existingRecord, //[!!]: Boolean型に変換,existingRecordをBoolean型に変換
        recordId: existingRecord?.id || null, // 存在する場合のみ編集ページへのリダイレクト用にIDを含める
      });
    }

    // 記録が既に存在する場合は409エラー
    if (existingRecord) {
      return NextResponse.json(
        {
          status: "error",
          message: "本日の記録は既に登録されています。",
          exists: true,
          recordId: existingRecord.id, // 編集ページへのリダイレクト用にIDを含める
        },
        { status: 409 }
      );
    }

    // 記録が存在しない場合
    return NextResponse.json({
      status: "success",
      exists: false,
    });
  } catch (error) {
    console.error("日記チェックエラー:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "既存記録の確認中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
};
