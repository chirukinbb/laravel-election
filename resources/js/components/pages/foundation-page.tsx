import type {ReactNode} from "react";

import {Container} from "@/components/ui/container";
import {Stack} from "@/components/ui/stack";
import {StatusBadge} from "@/components/ui/status-badge";

interface FoundationPageProps {
  readonly children?: ReactNode;
  readonly description: string;
  readonly eyebrow?: string;
  readonly status?: string;
  readonly title: string;
}

export function FoundationPage({
                                 children,
                                 description,
                                 eyebrow = "Foundation route",
                                 status = "CONTENT REQUIRED",
                                 title,
                               }: FoundationPageProps) {
  return (
      <Container readingWidth>
        <Stack gap={8}>
          <header className="page-intro">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
            <StatusBadge>{status}</StatusBadge>
          </header>
          {children}
        </Stack>
      </Container>
  );
}
