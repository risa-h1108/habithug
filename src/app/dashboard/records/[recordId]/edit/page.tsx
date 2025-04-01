"use client";

import { Button } from "@/app/_components/Button";
import { Footer } from "@/app/_components/Footer";
import { Input } from "@/app/_components/Input";
import { Label } from "@/app/_components/Label";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { formatDate } from "@/_untils/formatDate";
import { ButtonStyle } from "@/app/_components/ButtonStyle";
import { PlaceholderText } from "@/app/_components/PlaceholderText";
import { PraiseData } from "@/app/_types/Diary/PraiseData";
import { DiaryData } from "@/app/_types/Diary/DiaryData";
import { UpdateDiaryForm } from "@/app/_types/Diary/UpdateDiaryForm";

export default function Page() {
  const { token } = useSupabaseSession();
  const router = useRouter();
  const params = useParams();
  const recordId = params.recordId as string;

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  type reflectionType = "VERY_GOOD" | "GOOD" | "MORE"; //振り返りのタイプを列挙型で型定義
  const [selectedReflection, setSelectedReflection] =
    useState<reflectionType | null>(null);

  // useFormを使用してフォームの状態を管理
  const {
    register,
    handleSubmit: reactHookFormHandleSubmit,
    formState: { isSubmitting },
    control,
    reset,
  } = useForm<UpdateDiaryForm>({
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

  // 記録を取得
  useEffect(() => {
    const fetchDiary = async () => {
      if (!token || !recordId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/records/${recordId}`, {
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok && response.status === 404) {
          {
            alert("指定された記録が見つかりません。");
            router.replace("/dashboard/records/new");
            return;
          }
          throw new Error("記録の取得に失敗しました。");
        }

        const result = await response.json();

        if (result.status === "success" && result.data) {
          const diaryData: DiaryData = result.data;
          setSelectedDate(new Date(diaryData.date));
          setSelectedReflection(diaryData.reflection);

          // フォームの初期値を設定
          reset({
            reflection: diaryData.reflection,
            additionalNotes: diaryData.additionalNotes || "",
            praises:
              diaryData.praises.length > 0
                ? diaryData.praises.map((p: PraiseData) => ({
                    praiseText: p.praiseText,
                  }))
                : [{ praiseText: "" }, { praiseText: "" }, { praiseText: "" }],
          });
        }
      } catch (error) {
        console.error("Error fetching diary:", error);
        alert("記録の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [token, recordId, router, reset]);

  // フォーム送信の処理
  const handleSubmit = async (data: UpdateDiaryForm) => {
    if (!selectedReflection) {
      alert("振り返りのタイプを選択してください。");
      return;
    }

    if (!token || !recordId) {
      alert("ユーザーが認証されていないか、記録IDが見つかりません。");
      return;
    }

    try {
      // フォームデータの準備
      const updateData = {
        reflection: selectedReflection,
        additionalNotes: data.additionalNotes || "",
        //filter:条件に合う要素だけを抽出して新しい配列を作成
        //trim(): 文字列の前後の空白を削除
        //[!== ""]: 空文字列でないことをチェック
        praises: data.praises.filter(
          (praise) => praise.praiseText.trim() !== ""
        ),
      };

      console.log("Updating diary with data:", updateData);

      const response = await fetch(`/api/dashboard/records/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 403) {
          alert(errorData.message);
          router.replace("/login");
        } else {
          throw new Error(errorData.message || "記録の更新に失敗しました。");
        }
      } else {
        alert("記録を更新しました。");
        router.replace(`/dashboard/records/${recordId}/edit`);
      }
    } catch (error) {
      console.error("Error updating diary:", error);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  // 削除処理
  const deleteDiary = async () => {
    if (!token || !recordId) {
      alert("ユーザーが認証されていないか、毎日の記録が登録されていません。");
      return;
    }

    if (!confirm("この記録を削除してもよろしいですか？")) {
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

        if (response.status === 403) {
          alert(errorData.message);
          router.replace("/login");
        } else {
          throw new Error(errorData.message || "記録の削除に失敗しました。");
        }
      } else {
        alert("記録を削除しました。");
        router.replace("/dashboard/records/new");
      }
    } catch (error) {
      console.error("Error deleting diary:", error);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center pt-[120px] px-4 pb-32">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6">記録の編集</h1>

          <form
            //reactHookFormHandleSubmit：フォームのデータが正しく入力されているかを確認
            // handleSubmit:実際にフォームのデータを処理
            onSubmit={reactHookFormHandleSubmit(handleSubmit)}
            className="space-y-16"
          >
            <div>
              <Label htmlFor="Today'sHabit">今日の習慣は...？</Label>
              <h2 className="mt-2">記録日: {formatDate(selectedDate)}</h2>

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

              {/* 振り返りボタン */}
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

              {/* 褒めるポイント入力欄 */}
              <div className="pt-8">
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

              {/* 日記入力欄 */}
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

            {/* ボタン */}
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
