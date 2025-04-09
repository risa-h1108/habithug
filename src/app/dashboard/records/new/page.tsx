"use client";

import { Button } from "@/app/_components/Button";
import { Footer } from "@/app/_components/Footer";
import { Input } from "@/app/_components/Input";
import { Label } from "@/app/_components/Label";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm, useFieldArray } from "react-hook-form";
import { CreateDiaryRequestBody } from "@/app/_types/Diary/CreateDiaryRequestBody";
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

  //URLから日付情報を取得（?date=2025-04-02のように）し、その日付の新規登録ページを表示させる
  // URLからdateパラメータを取得
  useEffect(() => {
    // URLからクエリパラメータを取得
    // window.location.search: 現在のURLのクエリパラメータを取得
    const queryParams = new URLSearchParams(window.location.search);
    //dateという名前のクエリパラメータの値を取得
    const dateParam = queryParams.get("date");

    // dateパラメータがある場合は日付を設定
    if (dateParam) {
      try {
        const paramDate = new Date(dateParam);
        // paramDate.getTime(): 日付のミリ秒数を取得
        // isNaN(): 日付が有効かどうかをチェック, 日付が無効の場合はNaN（「数値ではない」ことを示す特殊な値、数値として期待される場所で無効な数値が発生した場合に使用）を返す
        if (!isNaN(paramDate.getTime())) {
          setSelectedDate(paramDate);
        }
      } catch (error) {
        console.error("Invalid date parameter:", error);
      }
    }
  }, []);

  // ページロード時に既存の記録をチェック
  useEffect(() => {
    const checkExistingRecord = async () => {
      if (!token) return;

      try {
        const today = new Date();
        const queryParams = new URLSearchParams({
          date: today.toISOString(),
          checkOnly: "true",
        });

        console.log(
          `Checking URL: /api/dashboard/records/check?${queryParams}`
        );

        const response = await fetch(
          `/api/dashboard/records/check?${queryParams}`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            alert("本日の記録は既に登録されています。");
            if (data.recordId) {
              router.replace(`/dashboard/records/${data.recordId}/edit`);
            }
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

  // 日付が変更された時の処理
  //event(=イベントオブジェクト):ユーザーがカレンダーUIで日付を選択したときの情報を保持
  const handleDateChange = async (event: {
    target: { value: string | number | Date };
  }) => {
    const newDate = new Date(event.target.value); // 新しい日付を取得

    // 未来の日付は選択できないようにする
    if (newDate > new Date()) {
      alert("未来の日付は選択できません。");
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        date: newDate.toISOString(),
        checkOnly: "true",
      });

      const response = await fetch(
        `/api/dashboard/records/check?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: token || "",
          },
        }
      );

      const data = await response.json();

      if (data.exists) {
        alert("この日付の記録は既に登録されています。");
        if (data.recordId) {
          router.replace(`/dashboard/records/${data.recordId}/edit`);
        }
        return;
      }

      // 記録が存在しない場合のみ日付を更新
      setSelectedDate(newDate);
    } catch (error) {
      console.error("Error checking date:", error);
      alert("日付の確認中にエラーが発生しました。");
    }
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

      // 重複チェックを先に行う
      const checkParams = new URLSearchParams({
        date: selectedDate.toISOString(),
        checkOnly: "true",
      });

      const checkResponse = await fetch(
        `/api/dashboard/records/check?${checkParams}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        alert("この日付の記録は既に登録されています。");
        if (checkData.recordId) {
          router.replace(`/dashboard/records/${checkData.recordId}/edit`);
        }
        return;
      }

      // 記録が存在しない場合のみ新規作成
      const response = await fetch("/api/dashboard/records/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 403) {
          alert(errorData.message);
          router.replace("/login");
        } else if (response.status === 409) {
          alert("この日付の記録は既に登録されています。");
          if (errorData.recordId) {
            router.replace(`/dashboard/records/${errorData.recordId}/edit`);
          }
        } else {
          throw new Error(errorData.message);
        }
      } else {
        const responseData = await response.json();
        alert("毎日の記録を登録しました。");
        if (responseData.recordId) {
          router.replace(`/dashboard/records/${responseData.recordId}/edit`);
        }
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

              <div className="flex items-center">
                <div className="flex-grow">
                  <label htmlFor="date-input">日付を選択:</label>
                  <input
                    id="date-input"
                    type="date"
                    value={selectedDate.toISOString().split("T")[0]} // YYYY/MM/DD形式
                    onChange={handleDateChange} // 日付変更時の処理
                    max={new Date().toISOString().split("T")[0]} // 今日の日付を最大値に設定
                  />
                </div>
              </div>

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
