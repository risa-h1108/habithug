//日記作成リクエストの型
export type UpdateDiaryRequestBody = {
  reflection?: "VERY_GOOD" | "GOOD" | "MORE";
  additionalNotes?: string;
  praises?: {
    praiseText: string;
  }[];
};
