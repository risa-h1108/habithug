//日記更新フォームの型

import { PraiseData } from "./PraiseData";

export type UpdateDiaryForm = {
  reflection: "VERY_GOOD" | "GOOD" | "MORE";
  additionalNotes?: string;
  praises: PraiseData[];
};
