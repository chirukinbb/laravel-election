import type {ComponentPropsWithoutRef} from "react";

import {classNames} from "@/lib/class-names";

export function Input({
                        className,
                        ...props
                      }: ComponentPropsWithoutRef<"input">) {
  return <input className={classNames("input", className)} {...props} />;
}

export function Textarea({
                           className,
                           ...props
                         }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={classNames("textarea", className)} {...props} />;
}

export function Select({
                         className,
                         ...props
                       }: ComponentPropsWithoutRef<"select">) {
  return <select className={classNames("select", className)} {...props} />;
}

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">,
    "id" | "type"> {
  readonly id: string;
  readonly label: string;
}

export function Checkbox({className, id, label, ...props}: CheckboxProps) {
  return (
      <div className="checkbox-field">
        <input
            className={classNames("checkbox", className)}
            id={id}
            type="checkbox"
            {...props}
        />
        <label htmlFor={id}>{label}</label>
      </div>
  );
}
