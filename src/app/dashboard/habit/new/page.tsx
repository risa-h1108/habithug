"use client";

import { supabase } from "@/untils/supabase";
import { useState, useEffect } from "react";
import { CreateHabitRequestBody } from "@/app/_types/Habit/PostRequest";
import { Label } from "@/app/_components/Label";
import { Input } from "@/app/_components/Input";
import { Button } from "@/app/_components/Button";
import { Footer } from "@/app/_components/Footer";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Page() {
  const [name, setName] = useState("");
  const [supplementaryDescription, setSupplementaryDescription] = useState("");
  const { token } = useSupabaseSession();
  const router = useRouter();

  // useFormを使用してフォームの状態を管理
  const {
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    // Supabaseから現在のユーザー情報を取得
    const getUserInfo = async () => {
      const { error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
      }
    };

    getUserInfo();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const handleLogout = () => {
      router.replace("/login");
    };

    if (!token) {
      alert("ユーザーが認証されていません。");
      return;
    }

    try {
      const body: CreateHabitRequestBody = {
        name,
        supplementaryDescription,
      };
      const response = await fetch("/api/dashboard/habit/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(body), // 直接bodyを送信
      });

      if (!response.ok) {
        const errorData = await response.json();

        // トークンが無効な場合の処理
        if (response.status === 403) {
          alert(errorData.message); // ユーザーにエラーメッセージを表示
          // ここでログアウト処理を行う
          handleLogout();
        } else {
          throw new Error(errorData.message);
        }
      } else {
        setName("");
        setSupplementaryDescription("");
        alert("習慣を登録しました。");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <div className="flex justify-center pt-[240px] px-4">
      <div className="w-full  max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-16">
          <div>
            <Label htmlFor="habitName">
              身に付けたい習慣（1日5分でできる内容）
            </Label>
            <Input
              type="text"
              name="habitName"
              id="habitName"
              required
              onChange={(e) => setName(e.target.value)}
              value={name}
              disabled={isSubmitting} //送信中には入力やボタンを無効化する
            />
          </div>
          <div>
            <Label htmlFor="supplementaryDescription">補足（あれば）</Label>
            <textarea
              name="supplementaryDescription"
              id="supplementaryDescription"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => setSupplementaryDescription(e.target.value)}
              value={supplementaryDescription}
              disabled={isSubmitting} //送信中には入力やボタンを無効化する
            />
          </div>
          <Button
            color="blue"
            size="small"
            type="submit"
            disabled={isSubmitting}
          >
            決定
          </Button>
        </form>
        <Footer />
      </div>
    </div>
  );
}
