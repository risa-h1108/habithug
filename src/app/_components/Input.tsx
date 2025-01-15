"use client";

//Inputコンポーネントの型定義（InputProps）の型定義

//`HTMLInputElement`が持つすべての属性を含む`React.InputHTMLAttributes`を拡張
//`<input>タグで使用できるすべてのプロパティ（例えばtype`、`name`、`value`、`onChange`など）をこのコンポーネントでも使用できる
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

//Inputのコンポーネント
export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      className={
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-300 focus:border-green-300 block w-full p-2.5"
      }
    />
  );
};

//Labelのコンポーネント
export const Label: React.FC<{
  htmlFor: string;
  children: React.ReactNode; //`React.ReactNode`型は、文字列、数値、React要素、配列、null、またはundefinedを許容
}> = ({ htmlFor, children }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block mb-2 text-sm font-medium text-gray-900"
    >
      {children}
    </label>
  );
};

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
