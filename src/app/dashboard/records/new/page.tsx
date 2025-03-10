"use client";

import { Button } from "@/app/_components/Button";
import { Footer } from "@/app/_components/Footer";
import { Input } from "@/app/_components/Input";
import { Label } from "@/app/_components/Label";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm, useFieldArray } from "react-hook-form";
import { CreateDiaryRequestBody } from "@/app/_types/Diary/PostRequest";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import Script from "next/script";

export default function Page() {
  const { token } = useSupabaseSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date()); // 現在の日付の状態を管理

  // ページロード時に既存の記録をチェック
  useEffect(() => {
    const checkExistingRecord = async () => {
      if (!token) return;

      try {
        const today = new Date();
        const response = await fetch("/api/dashboard/records/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          //以下のデータが入る
          // {date: today（new Date()で作成された日付）,// 日付オブジェクト
          // checkOnly: true // チェックモードフラグ}
          body: JSON.stringify({ date: today, checkOnly: true }), //「checkOnly: true 」：レコードの存在確認のみを行う、新規レコードは作成しない
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            alert("本日の記録は既に登録されています。");
            router.replace("/dashboard/records/{id}/edit");
          }
        }
      } catch (error) {
        console.error("Error checking existing record:", error);
      }
    };

    checkExistingRecord();
  }, [token, router]);

  type reflectionType = "VERY_GOOD" | "GOOD" | "MORE"; //振り返りのタイプを列挙型で型定義
  const [selectedReflection, setSelectedReflection] =
    useState<reflectionType | null>(null); //選択されたボタンの状態を管理、初期値はnullのため、nullかreflectionType が入る

  // useFormを使用してフォームの状態を管理
  const {
    register,
    handleSubmit: reactHookFormHandleSubmit,
    formState: { isSubmitting },
    control,
  } = useForm<CreateDiaryRequestBody>({
    defaultValues: {
      praises: [{ praiseText: "" }, { praiseText: "" }, { praiseText: "" }],
    },
  });

  //fields：現在のフィールドの配列(情報)を保持
  //append: 新しいフィールドを配列の末尾に追加するための関数
  const { fields, append } = useFieldArray({
    name: "praises",
    control,
  });

  // 日付を「YYYY/MM/DD」形式に変換
  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString("ja-JP")
      .replace(/年|月/g, "/")
      .replace(/日/g, "");
  };

  // 日付が変更された時の処理
  //event(=イベントオブジェクト):ユーザーがカレンダーUIで日付を選択したときの情報を保持
  const handleDateChange = (event: {
    target: { value: string | number | Date };
  }) => {
    const newDate = new Date(event.target.value); // 新しい日付を取得
    setSelectedDate(newDate); // 状態を更新
  };

  // フォーム送信の処理
  const handleSubmit = async (data: CreateDiaryRequestBody) => {
    // reflectionが未選択の場合はエラーを表示
    if (!selectedReflection) {
      alert("振り返りのタイプを選択してください。");
      return;
    }

    if (!token) {
      alert("ユーザーが認証されていません。");
      return;
    }

    try {
      data.reflection = selectedReflection as reflectionType; //「data.reflection」にselectedReflectionのデータが入る。その際にas構文でreflectionTypeの列挙型だと型を明示的に指定
      data.date = selectedDate; //dataのdata（日付）にselectedDate のデータを入れる。

      console.log("Submitting form with data:", data);

      const response = await fetch("/api/dashboard/records/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ ...data, checkOnly: false }), //「checkOnly: false」実際にレコードを作成する処理を実施
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 403) {
          alert(errorData.message);
          router.replace("/login");
        } else if (response.status === 409) {
          //409は重複エラー
          alert("本日の記録は既に登録されています。");
          router.replace("/dashboard/records/{id}/edit");
        } else {
          throw new Error(errorData.message);
        }
      } else {
        alert("毎日の記録を登録しました。");
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <>
      <div className="flex justify-center pt-[120px] px-4 pb-32 ">
        <div className="w-full max-w-lg">
          <form
            //reactHookFormHandleSubmit：フォームのデータが正しく入力されているかを確認
            // handleSubmit:実際にフォームのデータを処理
            onSubmit={reactHookFormHandleSubmit(handleSubmit)}
            className="space-y-16"
          >
            <div>
              <Label htmlFor="Today'sHabit">今日の習慣は...？</Label>
              <h1>今日の日付：{formatDate(selectedDate)}</h1>

              <label htmlFor="date-input">日付を選択:</label>
              <input
                id="date-input"
                type="date"
                value={selectedDate.toISOString().split("T")[0]} // YYYY/MM/DD形式
                onChange={handleDateChange} // 日付変更時の処理
                max={new Date().toISOString().split("T")[0]} // 今日の日付を最大値に設定
              />

              {/*X のシェアボタン（ </Script>まで）*/}
              <a
                href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                className="twitter-share-button"
                data-hashtags="HabitHug"
                data-show-count="false"
              >
                ポストする
              </a>
              {/*widgets.js を読み込むためにScriptタグ（重複制御ができるnext/script）を使用 */}
              <Script
                async
                src="https://platform.twitter.com/widgets.js"
              ></Script>

              {/*下記からbuttonのコード開始 */}
              <div className="flex justify-center space-x-6 transform -translate-x-2">
                {/*選択肢の情報を持つオブジェクトの配列でラジオボタンを作成 */}
                {[
                  { id: "VERY_GOOD", label: "very good", color: "blue" },
                  { id: "GOOD", label: "good", color: "cyan" },
                  { id: "MORE", label: "more", color: "red" },
                ].map((option) => (
                  <div key={option.id}>
                    <input
                      type="radio"
                      name="reflection" //同じ名前のラジオボタンの中から1つだけ選択
                      id={option.id} //ラジオボタンのIDを設定
                      value={option.id} //選択値を設定
                      className="hidden"
                      checked={selectedReflection === option.id} //現在選択されているかどうかを判定
                      onChange={() =>
                        setSelectedReflection(option.id as reflectionType)
                      } //onChange：setSelectedReflection関数を呼び出し、選択された値を更新
                    />
                    <Label htmlFor={option.id}>
                      <div
                        className={`flex justify-center items-center w-28 h-28 text-center border-2 rounded-full cursor-pointer
                          ${
                            selectedReflection === option.id
                              ? option.color === "blue"
                                ? "border-blue-400 bg-blue-400"
                                : option.color === "cyan"
                                ? "border-cyan-300 bg-cyan-300"
                                : "border-red-500 bg-red-500"
                              : option.color === "blue"
                              ? "border-blue-700 hover:bg-blue-400"
                              : option.color === "cyan"
                              ? "border-blue-400 hover:bg-cyan-300"
                              : "border-red-500 hover:bg-red-400"
                          } p-4 my-4 text-3xl text-gray-600`}
                      >
                        {/* ユーザーが選択肢を視覚的に認識できるように {option.label}を記述*/}
                        {option.label}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              {/*上記まででbuttonのコード終了 */}

              <div className=" pt-8">
                <Label htmlFor="praises">
                  今日の自分を褒めること（必須：最低3つ）
                </Label>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      {...register(`praises.${index}.praiseText`, {
                        required: index < 3, // 最初の3つは必須
                      })}
                      id={`praise${index}`}
                      required={index < 3} // 最初の3つは必須
                      disabled={isSubmitting}
                      placeholder={`例：${
                        index === 0
                          ? "5分運動した"
                          : index === 1
                          ? "朝ご飯食べた"
                          : index === 2
                          ? "脚ストレッチした"
                          : "今日の褒めを書いてみよう"
                      }`}
                      className={index >= 3 ? "mt-2" : ""} // 4つ目以降は上部に余白を追加
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => append({ praiseText: "" })} //クリックするとpraiseTextが追加される
                  className="flex items-center text-blue-500 hover:text-blue-700 mt-2"
                >
                  <FontAwesomeIcon icon={faCirclePlus} className="mr-2" />
                  追加
                </button>
              </div>

              <div className="pt-8">
                <Label htmlFor="additionalNotes">日記（任意）</Label>
                <textarea
                  {...register("additionalNotes")}
                  id="additionalNotes"
                  className="w-full p-2 border border-gray-300 rounded h-24"
                  disabled={isSubmitting}
                  placeholder="例：今日は昨日より少しコードが理解できるようになったのが嬉しかった。"
                />
              </div>
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

          <Footer />
        </div>
      </div>
    </>
  );
}
