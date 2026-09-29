import type {ReactNode} from "react";

interface FieldProps {
  readonly children: ReactNode;
  readonly description?: string | undefined;
  readonly descriptionId?: string | undefined;
  readonly error?: string | undefined;
  readonly errorId?: string | undefined;
  readonly htmlFor: string;
  readonly label: string;
  readonly required?: boolean;
}

export function Field({
                        children,
                        description,
                        descriptionId,
                        error,
                        errorId,
                        htmlFor,
                        label,
                        required = false,
                      }: FieldProps) {
  return (
      <div className="field">
        <label htmlFor={htmlFor}>
          {label}
          {required ? " (required)" : null}
        </label>
        {children}
        {description && descriptionId ? (
            <span className="field__description" id={descriptionId}>
          {description}
        </span>
        ) : null}
        {error && errorId ? (
            <span className="field__error" id={errorId}>
          {error}
        </span>
        ) : null}
      </div>
  );
}
