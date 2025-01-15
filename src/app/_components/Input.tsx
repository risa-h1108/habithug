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
