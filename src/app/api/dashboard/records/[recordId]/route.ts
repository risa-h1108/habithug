import { UpdateDiaryRequestBody } from "@/app/_types/Diary/UpdateRequest";
import { supabase } from "@/_untils/supabase";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const GET = async (
  request: NextRequest,
  { params }: { params: { recordId: string } }
) => {
  const token = request.headers.get("Authorization");

  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "認証トークンがありません。再ログインしてください。",
      },
      { status: 403 }
    );
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    // 送ったtokenが正しくない場合、errorが返却されるので、クライアントにもエラーを返す
    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 403 }
      );
    }

    // supabaseIdを使用してdiaryをDBから取得
    const supabaseId = data.user.id;

    // SupabaseのIDを使ってUserテーブルからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { supabaseId },
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
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { recordId: string } }
) => {
  const token = request.headers.get("Authorization");

  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "認証トークンがありません。再ログインしてください。",
      },
      { status: 403 }
    );
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 403 }
      );
    }

    const supabaseId = data.user.id;
    const user = await prisma.user.findUnique({
      where: { supabaseId },
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

    // URLからレコードIDを取得
    const recordId = params.recordId;

    // リクエストボディを取得
    const body: UpdateDiaryRequestBody = await request.json();
    const { reflection, additionalNotes, praises } = body;

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

    // 既存のpraisesを削除
    await prisma.praise.deleteMany({
      where: { diaryId: recordId },
    });

    // 日記を更新
    await prisma.diary.update({
      where: { id: recordId },
      data: {
        reflection: reflection || existingDiary.reflection, //reflectionが提供されない場合は既存の値を使用
        additionalNotes: additionalNotes,
      },
    });

    // 新しいpraisesを作成
    if (praises && praises.length > 0) {
      for (const praise of praises) {
        await prisma.praise.create({
          data: {
            praiseText: praise.praiseText,
            diaryId: recordId,
          },
        });
      }
    }

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
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { recordId: string } }
) => {
  const token = request.headers.get("Authorization");

  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "認証トークンがありません。再ログインしてください。",
      },
      { status: 403 }
    );
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "認証トークンが無効です。再ログインしてください。",
        },
        { status: 403 }
      );
    }

    const supabaseId = data.user.id;
    const user = await prisma.user.findUnique({
      where: { supabaseId },
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

    // 関連するpraisesを削除
    await prisma.praise.deleteMany({
      where: { diaryId: recordId },
    });

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
};
