import { Diary } from "@prisma/client";

export type HistoryData = {
  id: string;
  date: string;
  reflection: string[]; //最低3つ以上の自分を褒める内容を個別に取得する為、[]を追加
  diary: Diary;
};
