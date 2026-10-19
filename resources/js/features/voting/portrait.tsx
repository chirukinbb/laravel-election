import type {CSSProperties} from "react";
import {type Nominee, NOMINEE_PORTRAIT_ATLAS} from "./nominees";
import {fullName} from "./voting-model";

export function Portrait({
  person,
  large = false,
}: {
  readonly person: Nominee;
  readonly large?: boolean;
}) {
    const imageUrl = person.portraitUrl ?? NOMINEE_PORTRAIT_ATLAS;
  return (
    <span
      role="img"
      aria-label={fullName(person)}
      className={"voting-portrait" + (large ? " voting-portrait--large" : "")}
      style={
          {
              backgroundImage: `url("${imageUrl}")`,
          } as CSSProperties
      }
    />
  );
}
