"use client";

//Placeholderのテキスト文、4つ目以降はdefaultのreturnで記載
export const PlaceholderText = (index: number): string => {
  switch (index) {
    case 0:
      return "5分運動した";
    case 1:
      return "朝ご飯食べた";
    case 2:
      return "脚ストレッチした";
    default:
      return "今日の褒めを書いてみよう";
  }
};
