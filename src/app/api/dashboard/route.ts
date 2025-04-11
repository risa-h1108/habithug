import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  AuthenticationError,
} from "@/app/_components/Authentication";
import {
  CalendarData,
  DiaryCalendarItem,
} from "../../_types/Dashboard/CalendarData";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  try {
    // 認証処理
    const authResult = await authenticateUser(request);
    const { user } = authResult;

    try {
      // URLからパラメータを取得（月指定があれば、例：/api/records?month=3&year=2024）
      const { searchParams } = new URL(request.url);
      const monthParam = searchParams.get("month");
      const yearParam = searchParams.get("year");

      // 現在の年月を取得（パラメータがない場合はデフォルト値として使用）
      const now = new Date();
      const year = yearParam ? parseInt(yearParam) : now.getFullYear(); //parseIntで文字列を数値に変換、getFullYear：年の値を取得する（2000,2001とか）
      const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth(); // JavaScriptの月は0から始まるため調整

      // 指定された月の最初と最後の日付を計算
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // 翌月の0日目 = 当月の最終日

      // 並行処理でユーザーの記録と習慣情報を同時に取得
      const [diaries, habit] = await Promise.all([
        // ユーザーの記録を取得
        prisma.diary.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            date: true,
            reflection: true,
          },
          orderBy: {
            date: "asc", // 昇順（古い順）
          },
        }),

        // ユーザーの習慣情報を取得
        prisma.habit.findFirst({
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            name: true,
            supplementaryDescription: true,
          },
        }),
      ]);

      // カレンダーデータとして整形
      //prisma.diary.findManyでdiariesを取得した後、DiaryCalendarItem型に変換
      const diaryItems: DiaryCalendarItem[] = diaries.map((diary) => ({
        id: diary.id,
        date: diary.date.toISOString(), // Date型をISO形式の文字列に変換
        reflection: diary.reflection,
      }));

      const calendarData: CalendarData = {
        year,
        month: month + 1, // 表示用に1を足す
        habit,
        diaries: diaryItems,
      };

      return NextResponse.json({
        status: "success",
        data: calendarData,
      });
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "カレンダーデータの取得中にエラーが発生しました。",
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
