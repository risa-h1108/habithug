"use client";

//Buttonコンポーネントの型定義(ButtonProps)の型定義
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // 子要素を受け取るためのプロパティ
}

//Buttonのコンポーネント
export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props} // 他のプロパティをすべて渡す
      className={`w-full mt-14 text-white bg-green-300 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${props.className}`}
    >
      {/* ↓ボタンの中に表示する要素 */}
      {children}
    </button>
  );
};
