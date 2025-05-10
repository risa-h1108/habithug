"use client";

import { useEffect, useState } from "react";
import { UpdateHabitRequestBody } from "@/app/_types/Habit/UpdateRequestBody";
import { Label } from "@/app/_components/Label";
import { Input } from "@/app/_components/Input";
import { Button } from "@/app/_components/Button";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Page() {
  const { token } = useSupabaseSession();
  const router = useRouter();
  const [habitId, setHabitId] = useState<string | null>(null); // habitIdを管理する状態を追加

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<UpdateHabitRequestBody>();

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
          setHabitId(data.habit.id); // habitIdを設定
        }
      } catch (error) {
        console.error("Error fetching habit data:", error);
      }
    };

    fetchHabitData();
  }, [token, reset]);

  const updateHabit = async (data: UpdateHabitRequestBody) => {
    if (!token) {
      toast.error("ユーザーが認証されていません。");
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
          toast.error("認証が切れました。再度ログインしてください。");
          router.replace("/login");
        } else {
          throw new Error(errorData.message || "習慣の更新に失敗しました。");
        }
        return;
      }

      toast.success("習慣を更新しました。");
      router.refresh();
    } catch (error) {
      console.error("Error updating habit:", error);
      toast.error(
        error instanceof Error ? error.message : "習慣の更新に失敗しました。"
      );
    }
  };

  const deleteHabit = async () => {
    if (!token || !habitId) {
      toast.error("ユーザーが認証されていないか、習慣が登録されていません。");
      return;
    }
    try {
      const response = await fetch("/api/dashboard/habit/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error("認証が切れました。再度ログインしてください。");
          router.replace("/login");
        } else {
          throw new Error(errorData.message || "習慣の削除に失敗しました。");
        }
        return;
      }

      toast.success("習慣を削除しました。");
      router.push("/dashboard/habit/new");
    } catch (error) {
      console.error("Error updating habit:", error);
      toast.error(
        error instanceof Error ? error.message : "習慣の削除に失敗しました。"
      );
    }
  };

  return (
    <div className="flex justify-center pt-[120px] px-4 pb-32">
      <div className="w-full max-w-lg">
        <form onSubmit={handleSubmit(updateHabit)} className="space-y-16">
          <div>
            <Label htmlFor="name">身に付けたい習慣（1日5分でできる内容）</Label>
            <Input
              type="text"
              {...register("name", { required: true })}
              id="name"
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
              type="button" // typeをsubmitからbuttonに変更
              onClick={deleteHabit} // 削除処理を呼び出す
              disabled={isSubmitting}
            >
              削除
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
