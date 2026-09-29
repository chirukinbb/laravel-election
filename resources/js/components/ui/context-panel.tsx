import type {ComponentPropsWithoutRef} from "react";

import {classNames} from "@/lib/class-names";

interface ContextPanelProps extends ComponentPropsWithoutRef<"section"> {
  readonly label: string;
}

export function ContextPanel({
                               className,
                               label,
                               ...props
                             }: ContextPanelProps) {
  return (
      <section
          aria-label={label}
          className={classNames("context-panel", className)}
          {...props}
      />
  );
}
