"use client";

import { FormValues } from "@/app/_types/Contact/FormValues";
import { toast } from "react-toastify";
import { SubmitHandler, useForm } from "react-hook-form";
import { Label } from "@/app/_components/Label";
import { Input } from "@/app/_components/Input";
import { Button } from "@/app/_components/Button";

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      toast.success("送信しました", result);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="flex justify-center pt-36 px-4 pb-16">
      <div className="w-full max-w-[400px]">
        <div className="block mb-6 text-3xl font-medium text-gray-900 text-center">
          お問い合わせ
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">name</Label>
            <Input
              type="text"
              {...register("name", {
                required: "お名前は必須です。",
                maxLength: {
                  value: 30,
                  message: "お名前は30文字以内で入力してください。",
                },
              })}
              id="name"
              placeholder="山田太郎"
              required
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-700 mt-1">
                {errors.name?.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">email</Label>
            <Input
              type="email"
              {...register("email", {
                required: "メールアドレスは必須です。",
                pattern: {
                  value: /([a-z\d+\-.]+)@([a-z\d-]+(?:\.[a-z]+)*)/i,
                  message: "正しいメールアドレスを入力してください。",
                },
              })}
              id="email"
              placeholder="name@example.com"
              required
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-700 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message">message</Label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded h-24"
              {...register("message", {
                required: "本文は必須です。",
                maxLength: {
                  value: 500,
                  message: "本文は500文字以内で入力してください。",
                },
              })}
              id="message"
              placeholder="お問い合わせ内容をご記入ください"
              required
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-red-700 mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          <div>
            <Button
              color="green"
              size="long"
              type="submit"
              disabled={isSubmitting}
            >
              送信する
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
