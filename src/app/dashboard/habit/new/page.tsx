"use client";

import { CreateHabitRequestBody } from "@/app/_types/Habit/PostRequest";
import { Label } from "@/app/_components/Label";
import { Input } from "@/app/_components/Input";
import { Button } from "@/app/_components/Button";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Page() {
  const { token } = useSupabaseSession();
  const router = useRouter();

  // useFormを使用してフォームの状態を管理
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateHabitRequestBody>();

  const onSubmit = async (data: CreateHabitRequestBody) => {
    console.log("Submitting form with data:", data);

    if (!token) {
      alert("ユーザーが認証されていません。");
      return;
    }

    try {
      const response = await fetch("/api/dashboard/habit/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(data), // 直接bodyを送信
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
        alert("習慣を登録しました。");
        router.replace("/dashboard/habit");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("エラーが発生しました。もう一度お試しください。");
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
              決定
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
