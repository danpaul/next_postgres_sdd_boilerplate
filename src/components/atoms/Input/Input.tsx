import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input">;

const baseClasses =
  "w-full border border-zinc-200 bg-white px-4 py-2 text-base text-black placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed";

const Input = function Input({
  type = "text",
  className,
  ref,
  ...props
}: InputProps) {
  const classes = [baseClasses, className].filter(Boolean).join(" ");

  return <input {...props} ref={ref} type={type} className={classes} />;
};

export { Input };
export default Input;
