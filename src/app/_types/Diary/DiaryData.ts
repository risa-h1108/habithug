//日記データの型
export type DiaryData = {
  id: string;
  date: string;
  reflection: "VERY_GOOD" | "GOOD" | "MORE";
  additionalNotes: string | null;
  praises: Array<{
    id?: string;
    praiseText: string;
    diaryId?: string;
  }>;
  userId?: string;
};
