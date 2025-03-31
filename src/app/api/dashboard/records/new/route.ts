import { CreateDiaryRequestBody } from "@/app/_types/Diary/CreateDiaryRequestBody";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/app/_components/Authentication";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
  // 認証処理
  //authenticateUser関数にリクエストを渡して認証を実行
  const authResult = await authenticateUser(request);

  // NextResponseが返ってきた場合はエラー
  //(判定したいオブジェクト instanceof オブジェクト名称)：判定したいオブジェクトの種類が instanceof の後ろに記載したオブジェクト名称と一致する場合はtrue、不一致の場合はfalseを返却
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(24, 0, 0, 0)),
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
