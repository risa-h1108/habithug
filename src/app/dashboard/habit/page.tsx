"use client";

import { supabase } from "@/untils/supabase";
import { useEffect, useState } from "react";
import { UpdateHabitRequestBody } from "@/app/_types/Habit/UpdateRequestBody";
import { Label } from "@/app/_components/Label";
import { Input } from "@/app/_components/Input";
import { Button } from "@/app/_components/Button";
import { Footer } from "@/app/_components/Footer";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm } from "react-hook-form";
import { useRouteGuard } from "../_hooks/useRouteGuard";
import { useRouter } from "next/navigation";

export default function Page() {
  useRouteGuard(); // ログイン状態を確認
  const { token } = useSupabaseSession();
  const router = useRouter();
  const [habitId, setHabitId] = useState("");

  useEffect(() => {
    // Supabaseから現在のユーザー情報を取得
    const getUserInfo = async () => {
      const { error } = await supabase.auth.getUser();

      if (error) {
        router.replace("/login");
        console.error("Error fetching user:", error.message);
      }
    };

    getUserInfo();
  }, [router]);

  async function getHabitIdFromAPI(): Promise<string> {
    try {
      // サーバーにリクエストを送り、データを取得
      const response = await fetch("/api/dashboard/habit");

      // レスポンスが成功でない場合、エラーを投げる
      if (!response.ok) {
        throw new Error("Failed to fetch habitId");
      }

      // レスポンスをJSON形式に変換
      const data = await response.json();

      // habitIdを返す
      return data.habitId;
    } catch (error) {
      // エラーが発生した場合、コンソールにエラーメッセージを出力
      console.error("Error fetching habitId:", error);

      // エラー時には空の文字列を返す
      return "";
    }
  }

  useEffect(() => {
    // ここでhabitIdを取得して状態に設定
    const fetchHabitId = async () => {
      const fetchedId = await getHabitIdFromAPI();
      if (fetchedId) {
        setHabitId(fetchedId); // 取得したhabitIdを状態に設定
      } else {
        console.error("Failed to set habitId, fetchedId is empty");
      }
    };

    fetchHabitId();
  }, []);

  // useFormを使用してフォームの状態を管理
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<UpdateHabitRequestBody>();

  const onSubmit = async (data: UpdateHabitRequestBody) => {
    console.log("Submitting form with data:", data);

    if (!token) {
      alert("ユーザーが認証されていません。");
      return;
    }

    try {
      // dataの後にhabitIdを指定して上書き
      const requestBody = {
        ...data,
        habitId, // ここでhabitIdを上書き
      };

      console.log("Request Body:", requestBody);

      const response = await fetch("/api/dashboard/habit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 403) {
          alert(errorData.message);
          router.replace("/login");
        } else {
          throw new Error(errorData.message);
        }
      } else {
        reset();
        alert("習慣を更新しました。");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };
  return (
    <div className="flex justify-center pt-[240px] px-4">
      <div className="w-full  max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
          <div>
            <Label htmlFor="habitName">
              身に付けたい習慣（1日5分でできる内容）
            </Label>
            <Input
              type="text"
              {...register("name", { required: true })}
              id="habitName"
              required
              disabled={isSubmitting} //送信中には入力やボタンを無効化する
            />
          </div>
          <div>
            <Label htmlFor="supplementaryDescription">補足（あれば）</Label>
            <textarea
              {...register("supplementaryDescription")}
              id="supplementaryDescription"
              className="w-full p-2 border border-gray-300 rounded"
              disabled={isSubmitting} //送信中には入力やボタンを無効化する
            />
          </div>
          <Button
            color="blue"
            size="small"
            type="submit"
            disabled={isSubmitting}
          >
            更新
          </Button>
          <Button
            color="red"
            size="small"
            type="submit"
            disabled={isSubmitting}
          >
            削除
          </Button>
        </form>
        <Footer />
      </div>
    </div>
  );
}
