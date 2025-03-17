export type UpdateDiaryRequestBody = {
  date: Date;
  reflection: "VERY_GOOD" | "GOOD" | "MORE";
  praises: {
    praiseText: string;
  }[];
  additionalNotes?: string;
  userId: string;
};
