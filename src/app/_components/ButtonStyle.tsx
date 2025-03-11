"use client";

export const ButtonStyle = (color: string, isSelected: boolean): string => {
  //Reflectionのbutton選択時のカラー
  if (isSelected) {
    switch (color) {
      case "blue":
        return "border-blue-400 bg-blue-400";
      case "cyan":
        return "border-cyan-300 bg-cyan-300";
      case "red":
        return "border-red-500 bg-red-500";
      default:
        return "";
    }
    //Reflectionのbutton選択していない時のカラー
  } else {
    switch (color) {
      case "blue":
        return "border-blue-700 hover:bg-blue-400";
      case "cyan":
        return "border-blue-400 hover:bg-cyan-300";
      case "red":
        return "border-red-500 hover:bg-red-400";
      default:
        return "";
    }
  }
};
