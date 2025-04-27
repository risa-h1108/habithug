import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  AuthenticationError,
} from "@/app/_components/Authentication";
import { HistoryData } from "@/app/_types/Confirm/HistoryData";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  try {
    // 認証処理
    const authResult = await authenticateUser(request);
    const { user } = authResult;

    try {
      // ユーザーの記録を取得
      const diaries = await prisma.diary.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          date: true,
          additionalNotes: true,
          praises: {
            select: {
              id: true,
              praiseText: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      // 取得した記録をHistoryData型に変換
      const historyData: HistoryData[] = diaries.map((diary) => ({
        id: diary.id,
        date: diary.date.toISOString(),
        diary: {
          id: diary.id,
          date: diary.date,
          additionalNotes: diary.additionalNotes,
          praises: diary.praises,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id,
        },
      }));
      console.log(historyData);

      return NextResponse.json({
        status: "success",
        data: historyData,
      });
    } catch (error) {
      console.error("Error fetching history data:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "履歴データの取得中にエラーが発生しました。",
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
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    // その他のエラーの場合は汎用メッセージを返す
    console.error("エラー:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "エラーが発生しました。",
      },
      { status: 500 }
    );
  }
};
