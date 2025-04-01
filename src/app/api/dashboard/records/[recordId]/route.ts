import { UpdateDiaryRequestBody } from "@/app/_types/Diary/UpdateDiaryRequestBody";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  AuthenticationError,
} from "@/app/_components/Authentication";

const prisma = new PrismaClient();

export const GET = async (
  request: NextRequest,
  { params }: { params: { recordId: string } }
) => {
  try {
    // 認証処理
    //authenticateUser関数にリクエストを渡して認証を実行
    const authResult = await authenticateUser(request);

    //認証が成功した場合、authResultからユーザー情報を分割代入
    const { user } = authResult;

    try {
      // URLからレコードIDを取得
      const recordId = params.recordId;

      // 対象の日記を取得
      //findUniqueでwhereを使用する際は、idである必要があるため、id:○○と記述する。
      const diary = await prisma.diary.findUnique({
        where: {
          id: recordId,
          userId: user.id, // ユーザーのレコードのみアクセス可能
        },
        include: {
          praises: true, // praisesを含めて取得
        },
      });

      if (!diary) {
        return NextResponse.json(
          {
            status: "error",
            message: "指定された記録が見つかりません。",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: "success",
        data: diary,
      });
    } catch (error) {
      console.error("Error fetching diary:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "記録の取得中にエラーが発生しました。",
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

export const PUT = async (
  request: NextRequest,
  { params }: { params: { recordId: string } }
) => {
  try {
    // 認証処理
    const authResult = await authenticateUser(request);

    const { user } = authResult;
    // ここまで認証処理

    try {
      // URLからレコードIDを取得
      const recordId = params.recordId;

      // リクエストボディを取得
      const body: UpdateDiaryRequestBody = await request.json();
      const { reflection, additionalNotes } = body;

      // 指定されたレコードが存在するか確認
      const existingDiary = await prisma.diary.findUnique({
        where: {
          id: recordId,
          userId: user.id, // ユーザーのレコードのみアクセス可能
        },
      });

      if (!existingDiary) {
        return NextResponse.json(
          {
            status: "error",
            message: "指定された記録が見つかりません。",
          },
          { status: 404 }
        );
      }

      // 日記を更新
      await prisma.diary.update({
        where: { id: recordId },
        data: {
          reflection: reflection || existingDiary.reflection, //reflectionが提供されない場合は既存の値を使用
          additionalNotes: additionalNotes,
        },
      });

      // 更新後のデータを取得して返す
      const updatedDiaryWithPraises = await prisma.diary.findUnique({
        where: { id: recordId },
        include: {
          praises: true,
        },
      });

      return NextResponse.json({
        status: "success",
        message: "記録が更新されました",
        data: updatedDiaryWithPraises,
      });
    } catch (error) {
      console.error("Error updating diary:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "記録の更新中にエラーが発生しました。",
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

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { recordId: string } }
) => {
  try {
    // 認証処理
    const authResult = await authenticateUser(request);

    const { user } = authResult;

    try {
      // URLからレコードIDを取得
      const recordId = params.recordId;

      // 指定されたレコードが存在するか確認
      const existingDiary = await prisma.diary.findUnique({
        where: {
          id: recordId,
          userId: user.id, // ユーザーのレコードのみアクセス可能
        },
      });

      if (!existingDiary) {
        return NextResponse.json(
          {
            status: "error",
            message: "指定された記録が見つかりません。",
          },
          { status: 404 }
        );
      }

      // 日記を削除
      await prisma.diary.delete({
        where: { id: recordId },
      });

      return NextResponse.json({
        status: "success",
        message: "記録が削除されました",
      });
    } catch (error) {
      console.error("Error deleting diary:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "記録の削除中にエラーが発生しました。",
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
