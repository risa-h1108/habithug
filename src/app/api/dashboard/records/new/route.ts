import { CreateDiaryRequestBody } from "@/app/_types/Diary/CreateDiaryRequestBody";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  AuthenticationError,
} from "@/app/_components/Authentication";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  try {
    // 認証処理
    //authenticateUser関数にリクエストを渡して認証を実行
    const authResult = await authenticateUser(request);

    //認証が成功した場合、authResultからユーザー情報を分割代入
    const { user } = authResult;

    try {
      const userId = user.id;
      const body: CreateDiaryRequestBody = await request.json();
      const { date } = body;

      // 指定された日付の記録が存在するかチェック
      const existingRecord = await prisma.diary.findFirst({
        where: {
          userId,
          date: {
            gte: (() => {
              // 日付部分のみを取得して日本時間(JST)での日付オブジェクトを作成
              const dateObj = new Date(date);
              const year = dateObj.getFullYear();
              const month = dateObj.getMonth();
              const day = dateObj.getDate();
              // 日本時間での年月日だけの新しい日付を作成
              const jstDate = new Date(year, month, day);
              return jstDate;
            })(),
            lt: (() => {
              // 日付部分のみを取得して日本時間(JST)での日付オブジェクトを作成
              const dateObj = new Date(date);
              const year = dateObj.getFullYear();
              const month = dateObj.getMonth();
              const day = dateObj.getDate();
              // 日本時間での翌日の00:00:00を作成
              const jstDate = new Date(year, month, day + 1);
              return jstDate;
            })(),
          },
        },
        select: {
          id: true,
        },
      });

      // 記録が既に存在する場合は409エラー
      if (existingRecord) {
        return NextResponse.json(
          {
            status: "error",
            message: "本日の記録は既に登録されています。",
            recordId: existingRecord.id,
          },
          { status: 409 }
        );
      }

      // 新規登録処理
      const diary = await prisma.diary.create({
        data: {
          userId, // ユーザーID
          date: (() => {
            // 日付部分のみを取得して日本時間(JST)での日付オブジェクトを作成
            const dateObj = new Date(date);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth();
            const day = dateObj.getDate();
            // 日本時間での年月日だけの新しい日付を作成
            const jstDate = new Date(year, month, day);
            return jstDate;
          })(), // 日付
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
        { status: "error", message: "日記の作成中にエラーが発生しました。" },
        { status: 500 }
      );
    }
  } catch (error) {
    // AuthenticationErrorの場合はそのステータスコードとメッセージを使用
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
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
