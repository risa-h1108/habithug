"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { Footer } from "@/app/_components/Footer";
import Link from "next/link";
import { CalendarData } from "../_types/Dashboard/CalendarData";
import { formatDate } from "@/_untils/formatDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
  const { token } = useSupabaseSession();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12の形式

  // カレンダーデータを取得する関数（useCallbackでメモ化）
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
    let newYear = currentYear;

    // 月の範囲チェック
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
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

  // カレンダーの日付を生成する関数
  const generateCalendarDays = () => {
    if (!calendarData) return [];

    const year = calendarData.year;
    const month = calendarData.month - 1; // JavaScriptの月は0-11

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0: 日曜日, 1: 月曜日, ...

    // カレンダーの全セルを生成
    const calendarDays = [];

    // 前月の日付を追加
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push({ day: null, diary: null, isCurrentMonth: false });
    }

    // 今月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];

      // 該当する日の日記データを探す
      const diary = calendarData.diaries.find(
        (d) => new Date(d.date).toISOString().split("T")[0] === dateString
      );

      calendarDays.push({
        day,
        diary,
        isCurrentMonth: true,
        date,
      });
    }

    // 6週間分になるように翌月の日付を追加（最大42日）
    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({ day: i, diary: null, isCurrentMonth: false });
    }

    return calendarDays;
  };

  // 振り返りの状態に基づいて円の色とスタイルを決定する関数
  const getReflectionStyle = (reflection: string | null) => {
    if (!reflection) return "border-2 border-gray-300";

    switch (reflection) {
      case "VERY_GOOD":
        return "bg-blue-500 border-blue-600";
      case "GOOD":
        return "bg-cyan-400 border-cyan-500";
      case "MORE":
        return "bg-red-500 border-red-600";
      default:
        return "border-2 border-gray-300";
    }
  };

  // 二重丸のスタイルを決定する関数
  const getDoubleCircleStyle = (reflection: string | null) => {
    if (!reflection) return "";

    switch (reflection) {
      case "VERY_GOOD":
        return "border-2 border-blue-600";
      case "GOOD":
        return "border-2 border-cyan-500";
      case "MORE":
        return "border-2 border-red-600";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow px-4 pb-20">
        <div className="max-w-screen-md mx-auto mt-4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-green-400 text-white">
              <h2 className="text-xl font-semibold">習慣化カレンダー</h2>
              <Link
                href={`/dashboard/habit${calendarData?.habit ? "" : "/new"}`}
              >
                <div className="text-black p-2 rounded">
                  <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                </div>
              </Link>
            </div>

            {/* 月切り替えナビゲーション */}
            <div className="flex justify-between items-center p-3 bg-gray-100">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 rounded hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3 className="text-lg font-medium">
                {currentYear}年{currentMonth}月
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 rounded hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

            {/* カレンダーグリッド */}
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 ${
                    index === 0
                      ? "text-red-500"
                      : index === 6
                      ? "text-blue-500"
                      : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((dayData, index) => {
                const isToday =
                  dayData.isCurrentMonth &&
                  dayData.date &&
                  formatDate(dayData.date) === formatDate(new Date());

                return (
                  <div
                    key={index}
                    className={`
                      relative aspect-square p-1 border
                      ${!dayData.isCurrentMonth ? "bg-gray-200" : ""}
                      ${
                        dayData.isCurrentMonth && index % 7 === 0
                          ? "text-red-500"
                          : ""
                      }
                      ${
                        dayData.isCurrentMonth && index % 7 === 6
                          ? "text-blue-500"
                          : ""
                      }
                      ${isToday ? "bg-purple-100" : ""}
                    `}
                  >
                    {dayData.day && (
                      <>
                        <div className="text-sm">{dayData.day}</div>
                        {dayData.isCurrentMonth && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {dayData.diary ? (
                              <Link
                                href={`/dashboard/records/${dayData.diary.id}/edit`}
                                className="block w-full h-full"
                              >
                                <div className="flex items-center justify-center w-full h-full">
                                  <div
                                    className={`w-8 h-8 rounded-full ${getReflectionStyle(
                                      dayData.diary.reflection
                                    )}`}
                                  >
                                    {dayData.diary.reflection ===
                                      "VERY_GOOD" && (
                                      <div
                                        className={`w-5 h-5 rounded-full bg-white m-auto mt-1.5 ${getDoubleCircleStyle(
                                          dayData.diary.reflection
                                        )}`}
                                      ></div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ) : (
                              dayData.isCurrentMonth && (
                                <Link
                                  href={`/dashboard/records/new?date=${
                                    dayData.date?.toISOString().split("T")[0]
                                  }`}
                                  className={`w-8 h-8 rounded-full border-2 border-gray-300`}
                                ></Link>
                              )
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
