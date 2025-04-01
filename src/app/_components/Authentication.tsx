import { PrismaClient } from "@prisma/client";
import { supabase } from "@/_untils/supabase";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// 認証エラー用のカスタムエラークラス
export class AuthenticationError extends Error {
  statusCode: number; //エラーの種類を数値で表現、HTTPステータスコードを保持するプロパティ

  constructor(message: string, statusCode: number) {
    //エラーメッセージとステータスコードを受け取る
    super(message); //親クラス（Error）のコンストラクタを呼び出し
    this.name = "AuthenticationError";
    this.statusCode = statusCode;
  }
}

export const authenticateUser = async (request: NextRequest) => {
  const token = request.headers.get("Authorization");

  if (!token) {
    throw new AuthenticationError(
      "認証トークンがありません。再ログインしてください。",
      403
    );
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      throw new AuthenticationError(
        "認証トークンが無効です。再ログインしてください。",
        403
      );
    }

    const supabaseId = data.user.id;
    const user = await prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new AuthenticationError("ユーザーが見つかりません。", 404);
    }

    // 認証に成功した場合はユーザー情報を返す
    return { user, isError: false };
  } catch (error) {
    // 既にAuthenticationErrorの場合はそのまま投げる
    if (error instanceof AuthenticationError) {
      throw error;
    }

    console.error("認証エラー:", error);
    throw new AuthenticationError("認証処理中にエラーが発生しました。", 500);
  }
};
