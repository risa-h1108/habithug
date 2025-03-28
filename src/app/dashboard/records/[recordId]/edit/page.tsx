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
import { formatDate } from "@/_untils/formatDate";
import { ButtonStyle } from "@/app/_components/ButtonStyle";
import { PlaceholderText } from "@/app/_components/PlaceholderText";

export default function Page() {
  const { token } = useSupabaseSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date()); // 現在の日付の状態を管理
  const [recordId, setRecordId] = useState<string | undefined>(); // recordIdを管理する状態を追加

  // ページロード時に既存の記録をチェック
  useEffect(() => {
    const checkExistingRecord = async () => {
      if (!token) return;

      try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式に変換
        const response = await fetch(
          `/api/dashboard/records/check?date=${today}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setRecordId(data.recordId); // 取得したレコードIDを設定
            alert("本日の記録は既に登録されています。");
            router.replace(`/dashboard/records/${data.recordId}/edit`);
          }
        }
      } catch (error) {
        console.error("Error checking existing record:", error);
      }
    };
    checkExistingRecord();
  }, [token, router, recordId]);

  type reflectionType = "VERY_GOOD" | "GOOD" | "MORE"; //振り返りのタイプを列挙型で型定義
  const [selectedReflection, setSelectedReflection] =
    useState<reflectionType>(); //選択されたボタンの状態を管理

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

      const response = await fetch("/api/dashboard/records", {
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
          router.replace(`/dashboard/records/${recordId}/edit`);
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

  const deleteDiary = async () => {
    if (!token || !recordId) {
      alert("ユーザーが認証されていないか、毎日の記録が登録されていません。");
      return;
    }
    try {
      const response = await fetch(`/api/dashboard/records/${recordId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          alert("認証が切れました。再度ログインしてください。");
          router.replace("/login");
        } else {
          throw new Error(errorData.message || "習慣の削除に失敗しました。");
        }
        return;
      }

      alert("習慣を削除しました。");
      router.push("/dashboard/habit/new");
    } catch (error) {
      console.error("Error updating habit:", error);
      alert(
        error instanceof Error ? error.message : "習慣の削除に失敗しました。"
      );
    }
  };

  return (
    <>
      <div className="flex justify-center pt-[120px] px-4 pb-32">
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

              {/*X のシェアボタン*/}
              <div className="mt-4 mb-8">
                <a
                  href={`http://twitter.com/share?url=http://localhost:3001/dashboard/records/new&text=${formatDate(
                    selectedDate
                  )}の習慣を振り返りました！&hashtags=HabitHug`}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200"
                >
                  {/*svg:アイコンや図形を描画する
                     fill:SVGの色を指定,currentColorで<a>内と同じ色になる 
                     viewBox：SVGの描画領域を指定する、`0 0`が左上の座標で、`24 24`が右下の座標
                     aria-hidden="true":余計な情報を隠す*/}
                  <svg
                    className="w-5 h-5 "
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {/*<path>タグ*のd属性にSVGの中で実際に形を描くための描画するパス（線や形）の指示を記載*/}
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  投稿する
                </a>
              </div>
              {/*X のシェアボタン終了*/}

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
                         
                          ${ButtonStyle(
                            //コンポーネントから抜粋
                            option.color, //ボタンの色（'blue', 'cyan', 'red'）
                            selectedReflection === option.id //ボタンが選択されているかどうかを判断
                          )} p-4 my-4 text-3xl text-gray-600`}
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
                      placeholder={`例：${PlaceholderText(index)}`} //PlaceholderTextの関数コンポーネントにindexで各枠分岐
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
                更新
              </Button>
              <Button
                color="red"
                size="small"
                type="button" // typeをsubmitからbuttonに変更
                onClick={deleteDiary} // 削除処理を呼び出す
                disabled={isSubmitting}
              >
                削除
              </Button>
            </div>
          </form>
          <Footer />
        </div>
      </div>
    </>
  );
}
