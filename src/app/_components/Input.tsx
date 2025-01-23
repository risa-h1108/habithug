"use client";

import React, { forwardRef } from "react";

// Inputコンポーネントの型定義（InputProps）の型定義
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

//`HTMLInputElement`が持つすべての属性を含む`React.InputHTMLAttributes`を拡張
//`<input>タグで使用できるすべてのプロパティ（例えばtype`、`name`、`value`、`onChange`など）をこのコンポーネントでも使用できる

// Inputのコンポーネント
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref} // refをここで受け取る
      className={
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-300 focus:border-green-300 block w-full p-2.5"
      }
    />
  );
});

// React.forwardRefを使用する場合、displayNameを設定するとデバッグが容易になる
Input.displayName = "Input";
