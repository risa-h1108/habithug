import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/app/_components/Authentication";
import { HistoryData } from "@/app/_types/Confirm/HistoryData";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  try {
    // 認証処理
    const authResult = await authenticateUser(request);
    const { user } = authResult;

    // ユーザーの記録を取得
    const diaries = await prisma.diary.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        date: true,
        reflection: true,
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
      date: diary.date.toISOString(), //()を忘れない
      reflection: [diary.reflection], //最低3つ以上の自分を褒める内容を個別に取得する為、[]を追加
      diary: diary,
    }));
    console.log(historyData);

    return NextResponse.json({ historyData });
  } catch (error) {
    console.error("エラーが発生しました:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
};
