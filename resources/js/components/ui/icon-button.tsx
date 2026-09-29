import type {ComponentPropsWithoutRef} from "react";

import {classNames} from "@/lib/class-names";

interface IconButtonProps extends Omit<ComponentPropsWithoutRef<"button">,
    "aria-label"> {
  readonly label: string;
}

export function IconButton({
                             children,
                             className,
                             label,
                             type = "button",
                             ...props
                           }: IconButtonProps) {
  return (
      <button
          aria-label={label}
          className={classNames("icon-button", className)}
          type={type}
          {...props}
      >
        <span aria-hidden="true">{children}</span>
      </button>
  );
}
