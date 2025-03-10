"use client";

import { supabase } from "@/_untils/supabase";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // useFormを使用してフォームの状態を管理
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { email, password } = data;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("ログインに失敗しました");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="flex justify-center pt-[240px] px-4">
      <div className="w-full max-w-[400px]">
        <div className="block mb-6 text-3xl font-medium text-gray-900 text-center">
          ログイン
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">email</Label>
            <Input
              type="email"
              {...register("email", { required: true })}
              id="email"
              placeholder="name@company.com"
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
              ログイン
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
