import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRouteGuard = () => {
  const router = useRouter();
  const { session } = useSupabaseSession(); //ログインを確認する処理

  useEffect(() => {
    if (session === undefined) return; // sessionがundefinedの場合は読み込み中なので何もしない

    //ログイン情報がなければログインページに遷移させる
    const fetcher = async () => {
      if (session === null) {
        router.replace("/login");
      }
    };

    fetcher();
  }, [router, session]);
};
