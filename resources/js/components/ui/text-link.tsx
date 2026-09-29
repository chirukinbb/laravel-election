import Link from "next/link";
import type {ComponentProps} from "react";

import {classNames} from "@/lib/class-names";

export function TextLink({className, ...props}: ComponentProps<typeof Link>) {
  return <Link className={classNames("text-link", className)} {...props} />;
}
