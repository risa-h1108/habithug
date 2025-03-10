export type CreateDiaryRequestBody = {
  date: Date;
  checkOnly?: boolean; //新規作成の重複を防ぐ為
  reflection: "VERY_GOOD" | "GOOD" | "MORE";
  praises: {
    praiseText: string;
  }[];
  additionalNotes?: string;
  userId: string;
};
