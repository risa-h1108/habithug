"use client";

//Buttonコンポーネントの型定義(ButtonProps)の型定義
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // 子要素を受け取るためのプロパティ
  color: "blue" | "red" | "green"; // 色を指定するプロパティを追加
}

//Buttonのコンポーネント
export const Button: React.FC<ButtonProps> = ({
  children,
  color,
  ...props
}) => {
  const colorClasses = {
    green:
      "w-full mt-14 text-white bg-green-300 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ",
    blue: "bg-blue-500 text-white text-center hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg ml-auto flex justify-center items-center mt-52 text-2xl w-[90px] h-[45px]",
    red: "bg-red-500 text-white text-center hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg ml-auto flex justify-center items-center mt-52 text-2xl w-[90px] h-[45px] ",
  };

  return (
    <button
      {...props} // 他のプロパティをすべて渡す
      className={`${colorClasses[color]}`}
    >
      {/* ↓ボタンの中に表示する要素 */}
      {children}
    </button>
  );
};
