import type {CSSProperties} from "react";
import type {Nominee} from "./nominees";
import {fullName} from "./voting-model";

export function Portrait({
  person,
  large = false,
}: {
  readonly person: Nominee;
  readonly large?: boolean;
}) {
  const column = person.portraitIndex % 5;
  const row = Math.floor(person.portraitIndex / 5);
  return (
    <span
      role="img"
      aria-label={fullName(person)}
      className={"voting-portrait" + (large ? " voting-portrait--large" : "")}
      style={
        {
          "--portrait-x": column * 25 + "%",
          "--portrait-y": row * (100 / 3) + "%",
        } as CSSProperties
      }
    />
  );
}
