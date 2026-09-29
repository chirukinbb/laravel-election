import type {ComponentPropsWithoutRef} from "react";

import {classNames} from "@/lib/class-names";

interface StackProps extends ComponentPropsWithoutRef<"div"> {
  readonly gap?: 2 | 4 | 6 | 8;
}

export function Stack({className, gap = 4, ...props}: StackProps) {
  return (
      <div
          className={classNames("stack", `stack--${gap}`, className)}
          {...props}
      />
  );
}
