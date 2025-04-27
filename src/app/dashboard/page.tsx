"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import Link from "next/link";
import {
  CalendarData,
  CalendarDayItem,
} from "../_types/Dashboard/CalendarData";
import { formatDate } from "@/_untils/formatDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

export default function Page() {
  const { token } = useSupabaseSession();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12の形式

  // カレンダーデータを取得する関数（useCallbackでメモ化、不要な副作用の実行を防ぐため）
  const fetchCalendarData = useCallback(
    async (year: number, month: number) => {
      if (!token) return;

      try {
        setLoading(true); // ローディング開始
        const response = await fetch(
          `/api/dashboard?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error("カレンダーデータの取得に失敗しました");
        }

        const result = await response.json();
        if (result.status === "success") {
          setCalendarData(result.data);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false); // ローディング終了
      }
    },
    [token]
  );

  // 月を変更する関数
  const changeMonth = (increment: number) => {
    let newMonth = currentMonth + increment; // increment：数値の増減
    let newYear = currentYear; //月を変更する際に年が変わる可能性があるので、初めに現在の年(currentYear:現在の年を表す)を newYear に設定

    // 月の範囲チェック
    if (newMonth > 12) {
      //newMonth を1に設定し、newYearを1年進める
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      //newMonthを12に設定し、newYear を1年戻す
      newMonth = 12;
      newYear -= 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // 選択された月のカレンダーデータを取得
  useEffect(() => {
    fetchCalendarData(currentYear, currentMonth);
  }, [token, currentYear, currentMonth, fetchCalendarData]);

  // 振り返りに基づいてアイコンを表示する関数
  const renderReflectionIcon = (reflection: string | null) => {
    if (!reflection) return null;

    switch (reflection) {
      case "VERY_GOOD":
        return (
          <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center border-blue-600">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600"></div>
          </div>
        );
      case "GOOD":
        return (
          <div className="w-9 h-9 rounded-full border-2 border-cyan-500"></div>
        );
      case "MORE":
        return (
          <div className="w-9 h-9 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faArrowUp}
              className="text-2xl text-red-500 transform rotate-45"
            />
          </div>
        );
      default:
        return null;
    }
  };

  // 曜日に基づくテキスト色のクラスを返す関数
  const getDayOfWeekColorClass = (dayIndex: number) => {
    switch (dayIndex) {
      case 0: // 日曜日
        return "text-red-500";
      case 6: // 土曜日
        return "text-blue-500";
      default:
        return "";
    }
  };

  // セルのスタイルクラスを決定する関数
  const getCellClassNames = (
    dayData: CalendarDayItem,
    index: number //曜日（土曜日や日曜日）を判断するためのインデックス
  ) => {
    const classes = ["relative aspect-square p-1 border"]; //日付のセルのスタイルを設定するためのクラス

    // isCurrentMonth が false の場合(現在の月でない場合
    if (!dayData.isCurrentMonth) {
      classes.push("bg-gray-200");
    } else {
      // 日曜日の色
      if (index % 7 === 0) {
        classes.push("text-red-500");
        //土曜日の色
      } else if (index % 7 === 6) {
        classes.push("text-blue-500");
      }

      // dayData.dateが存在し、かつその日付が今日の日付と一致する場合
      if (
        dayData.date &&
        formatDate(new Date(dayData.date)) === formatDate(new Date())
      ) {
        classes.push("bg-purple-100");
      }
    }
    //クラスを結合して返す
    return classes.join(" ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    /*flex-col: 子要素を縦に並べる ,min-h-screen: 最小の高さを画面の高さに設定*/
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow px-4 pb-20">
        <div className="max-w-screen-md mx-auto mt-4">
          {/*overflow-hidden: 内容がこのコンテナの範囲を超えた場合に隠す設定 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-green-400 text-white">
              <h2 className="text-xl font-semibold">習慣化カレンダー</h2>
              {/*calendarData?.habitが存在する場合は /dashboard/habit に遷移し、存在しない場合は /dashboard/habit/new に遷移 */}
              <Link
                href={`/dashboard/habit${calendarData?.habit ? "" : "/new"}`}
              >
                <div className="text-black p-2 rounded">
                  <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                </div>
              </Link>
            </div>

            {/* 月の切り替え */}
            <div className="flex justify-between items-center p-3 bg-gray-100">
              {/*前の月に遷移するボタン*/}
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 rounded hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              {/*現在の年と月を表示する*/}
              <h3 className="text-lg font-medium">
                {currentYear}年{currentMonth}月
              </h3>
              {/*次の月に遷移するボタン*/}
              <button
                onClick={() => changeMonth(1)}
                className="p-2 rounded hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

            {/* カレンダー
            　grid：要素を行と列に配置させる
            grid-cols-7：グリッドの列数を指定する（7列）*/}
            <div className="grid grid-cols-7 border-b">
              {/*weekDays配列をmap関数でループし、各曜日を表示 */}
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  //getDayOfWeekColorClass関数を呼び出し、曜日に基づく色のクラスを取得
                  className={`text-center py-2 ${getDayOfWeekColorClass(
                    index
                  )}`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {/*calendarData.calendarDays配列が存在する場合は、その配列をmap関数でループし、各日付のセルを表示 */}
              {calendarData?.calendarDays &&
                calendarData.calendarDays.map((dayData, index) => (
                  <div
                    key={index}
                    //getCellClassNames関数を呼び出し、日付のセルのスタイルクラスを取得
                    className={getCellClassNames(dayData, index)}
                  >
                    {/*dayData.dayが存在する場合は、その日付を表示 */}
                    {dayData.day && (
                      <>
                        <div className="text-sm">{dayData.day}</div>
                        {/*dayData.isCurrentMonthがtrueの場合は、その日付が現在の月であることを示す*/}
                        {dayData.isCurrentMonth && (
                          /*absolute: 絶対配置。親要素の位置を基準にして配置される。
                          inset-0: 上、右、下、左のすべての辺が0に設定される。*/
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/*dayData.diaryが存在する場合は、毎日の記録の編集ページを表示 */}
                            {dayData.diary ? (
                              <Link
                                href={`/dashboard/records/${dayData.diary.id}/edit`}
                                className="block w-full h-full"
                              >
                                {/*renderReflectionIcon関数を呼び出し、振り返りに基づいてアイコンを表示 */}
                                <div className="flex items-center justify-center w-full h-full">
                                  {renderReflectionIcon(
                                    dayData.diary.reflection
                                  )}
                                </div>
                              </Link>
                            ) : (
                              /*dayData.diaryが存在しない場合は、「毎日の記録」の新規登録ページを表示 */
                              <Link
                                href={`/dashboard/records/new?date=${
                                  //dayData.dateが存在する場合、その値を使用
                                  dayData.date
                                    ? formatDate(new Date(dayData.date))
                                    : ""
                                }`}
                                className="w-9 h-9 rounded-full border-2 border-gray-300"
                              ></Link>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
