import { PrismaClient } from "@prisma/client";
import { supabase } from "@/_untils/supabase";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const authenticateUser = async (request: NextRequest) => {
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

    // 認証に成功した場合はユーザー情報を返す
    return { user, isError: false };
  } catch (error) {
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
