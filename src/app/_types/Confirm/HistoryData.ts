import { Reflection } from "@prisma/client";

// diary内のpraisesのための型
type Praise = {
  id: string;
  praiseText: string;
};

// DiaryWithPraises型を定義
type DiaryWithPraises = {
  id: string;
  date: Date;
  reflection: Reflection;
  additionalNotes: string | null;
  praises: Praise[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type HistoryData = {
  id: string;
  date: string;
  reflection: string[]; // 配列として格納
  diary: DiaryWithPraises;
};
