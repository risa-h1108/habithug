"use client";

import { useEffect, useState } from "react";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { Footer } from "@/app/_components/Footer";
import { HistoryData } from "@/app/_types/Confirm/HistoryData";
import Link from "next/link";

export default function Page() {
  const { token } = useSupabaseSession();
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // 履歴データを取得する関数
  useEffect(() => {
    const fetchHistoryData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/confirm", {
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("履歴データの取得に失敗しました");
        }

        const result = await response.json();
        if (result.status === "success") {
          setHistoryData(result.data);
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [token]);

  // 日付をフォーマットする関数（YYYY-MM-DD -> YYYY/MM/DD）
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* メインコンテンツ */}
      <main className="flex-grow px-0">
        <div className="w-full border-collapse">
          {/* テーブルヘッダー */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-4 text-center font-medium border-r">日付</div>
            <div className="p-4 text-center font-medium border-r">
              自分を褒めること
            </div>
            <div className="p-4 text-center font-medium">日記</div>
          </div>

          {/* 履歴データがない場合 */}
          {historyData.length === 0 && (
            <div className="text-center py-8">記録がありません</div>
          )}

          {/* 履歴データ */}
          {historyData.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/records/${item.id}/edit`}
              className="block"
            >
              <div className="grid grid-cols-3 border-b hover:bg-gray-50">
                <div className="p-4 border-r">
                  {formatDisplayDate(item.date)}
                </div>
                <div className="p-4 border-r">
                  {item.diary.praises.map((praise) => (
                    <div key={praise.id} className="mb-1">
                      {praise.praiseText}
                    </div>
                  ))}
                </div>
                <div className="p-4">{item.diary.additionalNotes || ""}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
