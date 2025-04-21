"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { HistoryData } from "@/app/_types/Confirm/HistoryData";

export default function Page() {
  const { token } = useSupabaseSession();
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistoryData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true); // ローディング開始
      const response = await fetch(`/api/dashboard/confirm`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const result = await response.json();
      if (result.status === "success") {
        setHistoryData(result.data);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
    } finally {
      setLoading(false); // ローディング終了
    }
  }, [token]);
}
