"use client";

import Link from "next/link";
import React from "react";
import { useSupabaseSession } from "../_hooks/useSupabaseSession";
import { supabase } from "@/untils/supabase";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCalendar } from "@fortawesome/free-regular-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(faEnvelope);

export const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut(); //ログアウト
    router.push("/"); // ログアウト後にログインページにリダイレクト
  };

  const { session, isLoading } = useSupabaseSession();

  return (
    <header className="bg-green-300 text-white p-6 font-bold flex justify-between items-center">
      <div className="flex items-center gap-4">
        {session ? (
          // ログインしている場合
          <Link href="/dashboard">
            <FontAwesomeIcon icon={faCalendar} className="text-2xl" />
          </Link>
        ) : (
          // ログインしていない場合
          <Link href="/" className="text-2xl">
            HabitHug
          </Link>
        )}
      </div>
      {!isLoading && (
        <div className="flex items-center gap-4">
          <Link href="/contact">
            <FontAwesomeIcon icon={faEnvelope} className="text-2xl" />
          </Link>
          {session ? (
            <button onClick={handleLogout}>ログアウト</button>
          ) : (
            <Link href="/login">ログイン</Link>
          )}
        </div>
      )}
    </header>
  );
};
