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
    <footer className="bg-white mt-24">
      {/* 緑の横線 */}
      <div className="w-full mx-auto border-t-4 border-green-300 mb-4"></div>

      <div className="flex justify-around w-3/4 mx-auto text-green-500">
        <div className="flex flex-col items-center space-y-2">
          <Link href="/dashboard/records/new">
            <div className="flex flex-col items-center space-y-1">
              <FontAwesomeIcon icon={faClipboard} className="text-3xl" />
              <span className="text-lg">記録</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Link href="/dashboard/records/{recordId}">
            <div className="flex flex-col items-center space-y-1">
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-3xl" />
              <span className="text-lg">履歴</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Link href="/dashboard/habit/new">
            <div className="flex flex-col items-center space-y-1">
              <FontAwesomeIcon icon={faAddressCard} className="text-3xl" />
              <span className="text-lg">習慣登録</span>
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
};
