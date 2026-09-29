import type {ComponentPropsWithoutRef} from "react";

import {classNames} from "@/lib/class-names";

interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  readonly readingWidth?: boolean;
}

export function Container({
                            className,
                            readingWidth = false,
                            ...props
                          }: ContainerProps) {
  return (
      <div
          className={classNames(
              "container",
              readingWidth && "container--reading",
              className,
          )}
          {...props}
      />
  );
}
