import {
  authenticateUser,
  AuthenticationError,
} from "@/app/_components/Authentication";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  try {
    // 認証処理
    //authenticateUser関数にリクエストを渡して認証を実行
    const authResult = await authenticateUser(request);

    // ユーザー情報を取得
    const { user } = authResult;

    try {
      // URLからdateパラメータを取得
      const { searchParams } = new URL(request.url);
      const date = searchParams.get("date");

      if (!date) {
        return NextResponse.json(
          { status: "error", message: "日付パラメータが必要です" },
          { status: 400 }
        );
      }

      // 指定された日付の記録が存在するかチェック
      //同じ日の重複が1件見つかれば十分な為、findFirstにする
      const diary = await prisma.diary.findFirst({
        where: {
          userId: user.id, // 特定ユーザーの記録のみ
          // 日付範囲の指定↓
          date: {
            // 日付の範囲を設定（0時から24時まで）
            //gte (Greater Than or Equal to)：以上（>=）
            //lt (Less Than)：未満（<）
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)), // 当日の00:00:00.000
            lt: new Date(new Date(date).setHours(24, 0, 0, 0)), // 当日の23:59:59.999
          }, //補足↓
          //  gt (Greater Than)：より大きい（>）
          //lte (Less Than or Equal to):以下（<=）
        },
        // IDも取得して、編集ページへのリダイレクト用に使用
        select: {
          id: true,
        },
      });

      // 記録の有無を返却
      return NextResponse.json({
        exists: !!diary, // 記録があればtrue、なければfalse,/[!!]: Boolean型に変換
        recordId: diary?.id ?? null, // 記録があればIDを、なければnullを返す,存在する場合のみ編集ページへのリダイレクト用にIDを含める
      });
    } catch (error) {
      console.error("Error checking diary:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "記録の確認中にエラーが発生しました",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // AuthenticationErrorの場合はそのステータスコードとメッセージを使用
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          status: "error",
          message: "本日の記録は既に登録されています。",
        },
        { status: error.statusCode }
      );
    }

    // その他のエラーの場合は汎用メッセージを返す
    console.error("認証エラー:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "認証処理中にエラーが発生しました。",
      },
      { status: 500 }
    );
  }
};
