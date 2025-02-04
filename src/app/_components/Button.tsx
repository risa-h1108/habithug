"use client";

//Buttonコンポーネントの型定義(ButtonProps)の型定義
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // 子要素を受け取るためのプロパティ
  color: "blue" | "red" | "green"; // 色を指定するプロパティを追加
  size: "long" | "small"; // サイズを指定するプロパティを追加
}

//Buttonのコンポーネント
export const Button: React.FC<ButtonProps> = ({
  children,
  color,
  size,
  ...props
}) => {
  // 共通のCSSクラス
  const baseClasses =
    "text-white font-medium rounded-lg focus:ring-4 focus:outline-none text-center   ";

  //色ごとのCSSクラス
  const colorClasses = {
    green: " bg-green-300 hover:bg-green-500   focus:ring-green-300    ",
    blue: "bg-blue-500  hover:bg-blue-700e focus:ring-blue-300   ",
    red: "bg-red-500  hover:bg-red-700   focus:ring-red-300   ",
  };

  // サイズごとのCSSクラス
  const sizeClasses = {
    long: "w-full mt-14 text-sm px-5 py-2.5",
    small:
      "ml-auto flex justify-center items-center mt-12 text-2xl w-[90px] h-[45px]",
  };

  return (
    <button
      {...props} // 他のプロパティをすべて渡す
      className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]}`}
    >
      {/* ↓ボタンの中に表示する要素 */}
      {children}
    </button>
  );
};
