"use client";

import { supabase } from "@/untils/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../_components/Input";
import { Label } from "../_components/Label";
import { Button } from "../_components/Button";
import { useForm } from "react-hook-form";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // useFormを使用してフォームの状態を管理
  const {
    formState: { isSubmitting },
  } = useForm();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="name@company.com"
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="password">password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              required
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Button color="green" type="submit" disabled={isSubmitting}>
              ログイン
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
