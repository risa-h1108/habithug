"use client";

interface BlueButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // 子要素を受け取るためのプロパティ
}

//Buttonのコンポーネント
export const BlueButton: React.FC<BlueButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <button
      {...props} // 他のプロパティをすべて渡す
      className="bg-blue-500 text-white text-center hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg ml-auto flex justify-center items-center mt-52 text-2xl "
      style={{ width: "90px", height: "45px" }}
    >
      {/* ↓ボタンの中に表示する要素 */}
      {children}
    </button>
  );
};
