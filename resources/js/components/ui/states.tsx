import type {ReactNode} from "react";

interface StateProps {
    readonly action?: ReactNode;
    readonly message: string;
    readonly title: string;
}

export function EmptyState({action, message, title}: StateProps) {
    return (
        <section className="empty-state">
            <h2>{title}</h2>
            <p>{message}</p>
            {action}
        </section>
    );
}

export function ErrorState({action, message, title}: StateProps) {
    return (
        <section className="error-state" role="alert">
            <h2>{title}</h2>
            <p>{message}</p>
            {action}
        </section>
    );
}
