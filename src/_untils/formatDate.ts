// 日付を「YYYY/MM/DD」形式に変換
export const formatDate = (date: Date) => {
  return date
    .toLocaleDateString("ja-JP")
    .replace(/年|月/g, "/")
    .replace(/日/g, "");
};
