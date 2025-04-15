import { Diary } from "@prisma/client";

export type HistoryData = {
  id: string;
  date: string;
  reflection: string;
  diary: Diary;
};
