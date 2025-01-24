"use client";

import { supabase } from "@/untils/supabase";
import { CreateUserRequestBody } from "../_types/User/PostRequest";
import { Input } from "../_components/Input";
import { Label } from "../_components/Label";
import { Button } from "../_components/Button";
import { useForm, SubmitHandler } from "react-hook-form";

// フォームの入力フィールドの型を定義
type FormValues = {
  email: string;
  password: string;
};

export default function Page() {
  // useFormを使用してフォームの状態を管理
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { email, password } = data;

    try {
      //supabase.auth.signUp:emailとpasswordを送信することで登録
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          //emailRedirectTo:送信するとメールアドレスの検証メールが送られ、そのメール内に載せる登録完了ページ用のURLを指定できます。
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/login`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      if (!data.user) {
        throw new Error("supabaseIdが取得出来ませんでした");
      }
      const body: CreateUserRequestBody = { supabaseId: data.user.id };
      await fetch(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/signup`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      alert("確認メールを送信しました。");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="flex justify-center pt-[240px] px-4">
      <div className="w-full max-w-[400px]">
        <div className="block mb-6 text-3xl font-medium text-gray-900 text-center">
          新規登録
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">email</Label>
            <Input
              type="email"
              {...register("email", { required: true })}
              id="email"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="password">password</Label>
            <Input
              type="password"
              {...register("password", { required: true })}
              id="password"
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Button
              color="green"
              size="long"
              type="submit"
              disabled={isSubmitting}
            >
              新規登録
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
