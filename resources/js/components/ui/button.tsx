import type {ComponentPropsWithoutRef} from "react";

import {classNames} from "@/lib/class-names";

export function Button({
                         className,
                         type = "button",
                         ...props
                       }: ComponentPropsWithoutRef<"button">) {
  return (
      <button
          className={classNames("button", className)}
          type={type}
          {...props}
      />
  );
}
