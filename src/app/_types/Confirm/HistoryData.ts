// diary内のpraisesのための型
type Praise = {
  id: string;
  praiseText: string;
};

// DiaryWithPraises型を定義
type DiaryWithPraises = {
  id: string;
  date: Date;
  additionalNotes: string | null;
  praises: Praise[];
};

export type HistoryData = {
  id: string;
  date: string;
  diary: DiaryWithPraises;
};
