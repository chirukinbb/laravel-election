import type {ComponentProps} from "react";

import {IconButton} from "@/components/ui/icon-button";

type CloseButtonProps = Omit<ComponentProps<typeof IconButton>, "children">;

export function CloseButton(props: CloseButtonProps) {
  return <IconButton {...props}>×</IconButton>;
}
