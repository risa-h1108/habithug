"use client";

import { supabase } from "@/untils/supabase";
import { useState } from "react";
import { CreateUserRequestBody } from "../_types/User/PostRequest";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      setEmail("");
      setPassword("");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-300 focus:border-green-300 block w-full p-2.5"
              placeholder="name@company.com"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-300 focus:border-green-300 block w-full p-2.5"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full mt-14 text-white bg-green-300 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              新規登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
