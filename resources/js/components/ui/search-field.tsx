import {Button} from "@/components/ui/button";
import {Field} from "@/components/ui/field";
import {Input} from "@/components/ui/form-controls";

interface SearchFieldProps {
    readonly defaultValue?: string | undefined;
    readonly error?: string | undefined;
}

export function SearchField({defaultValue, error}: SearchFieldProps) {
    const descriptionId = "site-search-description";
    const errorId = "site-search-error";
    const describedBy = error ? `${descriptionId} ${errorId}` : descriptionId;

    return (
        <form action="/search" className="search-field" role="search">
            <Field
                description="Search is limited to 120 characters. Results use local fixtures in this foundation."
                descriptionId={descriptionId}
                error={error}
                errorId={errorId}
                htmlFor="site-search"
                label="Search Tree of Unity"
            >
                <Input
                    aria-describedby={describedBy}
                    aria-invalid={Boolean(error)}
                    defaultValue={defaultValue}
                    id="site-search"
                    maxLength={120}
                    name="q"
                    required
                    type="search"
                />
            </Field>
            <Button type="submit">Search</Button>
        </form>
    );
}
