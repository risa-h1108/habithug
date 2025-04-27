// 日付を一貫した形式「YYYY/MM/DD」に変換
export const formatDate = (date: Date) => {
  const year = date.getFullYear(); //4桁の年を取得
  //String関数で月を文字列に変換
  //getMonth()は0から始まるため、1を足して1から始まるようにする
  //padStart(2, "0")は、2桁になるように0を追加
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// HTML input[type="date"]用の形式「YYYY-MM-DD」に変換
export const formatDateInputHTML = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
