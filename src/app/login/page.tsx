"use client";

import { supabase } from "@/untils/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Label } from "../_components/Input";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

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
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="name@company.com"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Button type="submit">ログイン</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
