export type CreateDiaryRequestBody = {
  date: Date;
  checkOnly?: boolean;
  reflection: "VERY_GOOD" | "GOOD" | "MORE";
  praises: {
    praiseText: string;
  }[];
  additionalNotes?: string;
  userId?: string;
};
