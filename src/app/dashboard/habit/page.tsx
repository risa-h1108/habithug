"use client";

import { supabase } from "@/untils/supabase";
import { useEffect } from "react";
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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<UpdateHabitRequestBody>();

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

  useEffect(() => {
    if (!token) return;
    const fetchHabitData = async () => {
      try {
        const response = await fetch("/api/dashboard/habit", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch habit data");
        }

        const data = await response.json();
        console.log("Habit Data:", data);

        if (data.habit) {
          reset(data.habit); // フォームに既存のデータを設定
        }
      } catch (error) {
        console.error("Error fetching habit data:", error);
      }
    };

    fetchHabitData();
  }, [token, reset]);

  const onSubmit = async (data: UpdateHabitRequestBody) => {
    if (!token) {
      alert("ユーザーが認証されていません。");
      return;
    }

    try {
      const response = await fetch("/api/dashboard/habit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          alert("認証が切れました。再度ログインしてください。");
          router.replace("/login");
        } else {
          throw new Error(errorData.message || "習慣の更新に失敗しました。");
        }
        return;
      }

      alert("習慣を更新しました。");
      router.refresh();
    } catch (error) {
      console.error("Error updating habit:", error);
      alert(
        error instanceof Error ? error.message : "習慣の更新に失敗しました。"
      );
    }
  };

  return (
    <div className="flex justify-center pt-[120px] px-4 pb-32">
      <div className="w-full max-w-lg">
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
              disabled={isSubmitting}
              placeholder="例：毎日5分運動する"
            />
          </div>
          <div>
            <Label htmlFor="supplementaryDescription">補足（あれば）</Label>
            <textarea
              {...register("supplementaryDescription")}
              id="supplementaryDescription"
              className="w-full p-2 border border-gray-300 rounded h-24"
              disabled={isSubmitting}
              placeholder="例：ジョギング5分間や筋トレYouTube1本など"
            />
          </div>
          <div className="flex space-x-4">
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
          </div>
        </form>
        <Footer />
      </div>
    </div>
  );
}
