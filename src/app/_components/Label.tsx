"use client";

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
