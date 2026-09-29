import type {ComponentPropsWithoutRef} from "react";

import {classNames} from "@/lib/class-names";

export function StatusBadge({
                              className,
                              ...props
                            }: ComponentPropsWithoutRef<"span">) {
  return <span className={classNames("status-badge", className)} {...props} />;
}
