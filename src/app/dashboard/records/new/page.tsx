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

              {/* Xのシェアボタン */}
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
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {/*<path>タグ*のd属性にSVGの中で実際に形を描くための描画するパス（線や形）の指示を記載*/}
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/*X のシェアボタン終了*/}
                {/* Threadsのシェアボタン */}
                <a
                  href={`https://www.threads.net/intent/post?text=${formatDate(
                    selectedDate
                  )}の習慣を振り返りました！`}
                  className="inline-flex items-center justify-center ml-2 p-2 w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Threadsでシェア"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.41v-.19c.031-4.673 1.595-7.216 3.212-8.673C6.617 1.606 8.681.686 11.034.149c.766-.174 1.198.021 1.326.096.11.065.269.215.314.619.077.683.044 1.599.033 2.023 0 .125-.007.19-.007.215-.012 1.312 1.092 1.5 2 1.523 1.003.033 2.173-.168 2.878-1.568.645-1.285 1.715-1.088 2.284-.883.593.213.995.664 1.033 1.168.015.62-.4 1.858-2.302 2.681-1.762.761-4.337 1.05-7.224.871-3.046-.189-4.03 1.69-4.03 4.224 0 2.534.984 4.413 4.03 4.224 2.887-.179 5.462.11 7.224.871 1.902.823 2.317 2.061 2.302 2.681-.038.504-.44.955-1.033 1.168-.57.204-1.64.402-2.285-.883-.704-1.4-1.875-1.602-2.877-1.568-.908.024-2.012.211-2 1.523 0 .025.006.09.006.215.011.424.044 1.34-.033 2.023-.045.404-.204.554-.314.619-.107.064-.466.191-1.092.096a6.514 6.514 0 01-.233-.053zm-1.564-2.276c.108 1.523 1.122 1.937 1.564 1.947.483 0 1.442-.372 1.321-1.947-.021-.287-.006-.916.01-1.539.033-1.177.066-2.562-.917-3.352-.77-.619-1.791-.88-3.045-.777-4.355.358-6.007-2.566-6.007-5.847 0-3.281 1.652-6.205 6.007-5.847 1.254.103 2.275-.159 3.045-.777.983-.79.95-2.175.917-3.352-.016-.623-.031-1.252-.01-1.539.121-1.575-.838-1.947-1.321-1.947-.442.01-1.456.424-1.564 1.947-.043.598-.016 1.646.011 2.185.049.989-.308 2.138-1.584 2.228-.392.028-.756-.017-1.071-.132-3.21-1.175-6.218.08-7.559 1.308-1.953 1.791-3.267 4.646-3.097 8.96.162 4.088 2.019 6.562 4.954 7.823.289.124.572.223.861.297.884.228 1.931.34 3.109.283 3.315-.157 4.602 1.176 4.789 2.33.043.27.148 1.313-.015 2.232z" />
                  </svg>
                </a>
              </div>
              {/*シェアボタン終了*/}

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
