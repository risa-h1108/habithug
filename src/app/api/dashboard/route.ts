import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  AuthenticationError,
} from "@/app/_components/Authentication";
import {
  CalendarData,
  DiaryCalendarItem,
  CalendarDayItem,
} from "../../_types/Dashboard/CalendarData";
import { formatDate } from "@/_untils/formatDate";

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

      // カレンダーの日付を生成する処理
      const displayMonth = month + 1; // 表示用に1を足す（1-12の範囲にする）
      const calendarDays = generateCalendarDays(year, month, diaryItems);

      const calendarData: CalendarData = {
        year,
        month: displayMonth,
        habit,
        diaries: diaryItems,
        calendarDays,
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

// カレンダーの日付を生成する関数
function generateCalendarDays(
  year: number,
  month: number,
  diaries: DiaryCalendarItem[]
): CalendarDayItem[] {
  const firstDay = new Date(year, month, 1); // 月の最初の日
  const lastDay = new Date(year, month + 1, 0); //month + 1 によって、次の月を指定, 0:次の月の「0日目」を表す

  const daysInMonth = lastDay.getDate(); //その月の最後の日を示す、カレンダーを表示する際に、何日まであるのかを知るために必要
  const startingDayOfWeek = firstDay.getDay(); // その月の1日目を示す、0: 日曜日, 1: 月曜日, ...6:土曜日を表す

  // カレンダーの全セルを生成
  const calendarDays: CalendarDayItem[] = []; //カレンダーの日付を格納する空の配列

  // 前月の日付を追加（カレンダーの最初の週の空白を埋める）
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ day: null, diary: null, isCurrentMonth: false });
  }

  // 今月の日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    // 日付オブジェクトの作成
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD形式

    // 該当する日の日記データを探す
    const diary =
      diaries.find((d) => {
        const diaryDate = new Date(d.date);
        return formatDate(diaryDate) === dateString;
      }) || null; // undefined の場合は null を返す

    calendarDays.push({
      day, // 日付（1-31）
      diary, // その日の日記データ
      isCurrentMonth: true, // 今月である
      date: date.toISOString(), // ISO形式の日付文字列
    });
  }

  // カレンダーが常に6週間分になるように翌月の日付を追加（最大42日）
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    //[day: i]:追加される日付を設定
    calendarDays.push({ day: i, diary: null, isCurrentMonth: false });
  }

  return calendarDays;
}
