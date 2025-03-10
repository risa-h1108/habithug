import React from "react";

enum Reflection {
  Very_Good = "◎",
  Good = "◯",
  More = "➚",
}

type ReflectionProps = {
  reflection: Reflection;
};

const ReflectionMark = ({ reflection }: ReflectionProps) => {
  let mark: string;

  switch (reflection) {
    case Reflection.Very_Good:
      mark = "◎";
      break;
    case Reflection.Good:
      mark = "◯";
      break;
    case Reflection.More:
      mark = "➚";
      break;
  }

  return <>The ReflectionMark is {mark}.</>;
};

export default ReflectionMark;
