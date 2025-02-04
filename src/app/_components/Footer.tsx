"use client";

import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faClipboard,
} from "@fortawesome/free-regular-svg-icons";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white">
      {/* 緑の横線 */}
      <div className="w-full mx-auto border-t-4 border-green-300"></div>

      <div className="flex justify-between px-12 mx-auto text-green-500 py-2">
        <div className="flex flex-col items-center">
          <Link href="/dashboard/records/new">
            <div className="flex flex-col items-center space-y-2">
              <FontAwesomeIcon icon={faClipboard} className="text-4xl" />
              <span className="text-lg">記録</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <Link href="/dashboard/confirm">
            <div className="flex flex-col items-center space-y-2">
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-4xl" />
              <span className="text-lg">履歴</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <Link href="/dashboard/habit/new">
            <div className="flex flex-col items-center space-y-2">
              <FontAwesomeIcon icon={faAddressCard} className="text-4xl" />
              <span className="text-lg">習慣登録</span>
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
};
