import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { UpdateHabitRequestBody } from "@/app/_types/Habit/UpdateRequestBody";
import {
  authenticateUser,
  AuthenticationError,
} from "@/app/_components/Authentication";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
  try {
    // 認証処理
    //authenticateUser関数にリクエストを渡して認証を実行
    const authResult = await authenticateUser(request);

    //認証が成功した場合、authResultからユーザー情報を分割代入
    const { user } = authResult;

    try {
      const userId = user.id; // ユーザーIDを取得

      //findUnique(1つのみ取得)：一意の識別子またはIDを指定する必要あり
      //findFirst(1つのみ取得)：条件に一致する最初のレコードを取得
      //findMany(複数件取得):条件に一致する全てのレコードを取得
      const habit = await prisma.habit.findUnique({
        where: { userId },
      });

      return NextResponse.json({ status: "OK", habit }, { status: 200 });
    } catch (error) {
      console.error("Error fetching habit:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          {
            status: "error",
            message: error.message,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          status: "error",
          message: "不明なエラーが発生しました",
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

export const PUT = async (request: NextRequest) => {
  try {
    // 認証処理
    const authResult = await authenticateUser(request);
    const { user } = authResult;

    try {
      const body: UpdateHabitRequestBody = await request.json();
      // リクエストボディから習慣の名前と補足説明を取得
      const { name, supplementaryDescription } = body;

      //この条件が真であれば、習慣の名前が正しく入力されていないと判断。
      //trim()メソッド:文字列の前後の空白を取り除く
      if (!name || name.trim() === "") {
        return NextResponse.json(
          {
            status: "error",
            message: "習慣の名前は必須です。",
          },
          { status: 400 }
        );
      }

      const userId = user.id;

      // 既存のhabitを更新
      const updatedHabit = await prisma.habit.update({
        where: { userId },
        data: {
          name: name.trim(),
          supplementaryDescription: supplementaryDescription?.trim(),
        },
      });

      return NextResponse.json(
        {
          status: "OK",
          habit: updatedHabit,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating habit:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          {
            status: "error",
            message: error.message,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          status: "error",
          message: "不明なエラーが発生しました",
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

export const DELETE = async (request: NextRequest) => {
  try {
    // 認証処理
    const authResult = await authenticateUser(request);
    const { user } = authResult;

    try {
      const userId = user.id;

      // ユーザーIDを用いてhabitを削除
      await prisma.habit.delete({
        where: { userId },
      });

      return NextResponse.json({ status: "OK" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting habit:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          {
            status: "error",
            message: error.message,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          status: "error",
          message: "不明なエラーが発生しました",
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
