"use client";

import {useId, useState} from "react";

interface AccordionItemProps {
    readonly children: React.ReactNode;
    readonly title: string;
}

export function AccordionItem({children, title}: AccordionItemProps) {
    const [open, setOpen] = useState(false);
    const id = useId();
    const buttonId = `${id}-button`;
    const panelId = `${id}-panel`;

    return (
        <section className="accordion__item">
            <h2 className="accordion__heading">
                <button
                    aria-controls={panelId}
                    aria-expanded={open}
                    className="accordion__trigger"
                    id={buttonId}
                    onClick={() => setOpen((current) => !current)}
                    type="button"
                >
                    {title}
                </button>
            </h2>
            <div
                aria-labelledby={buttonId}
                className="accordion__panel"
                hidden={!open}
                id={panelId}
                role="region"
            >
                {children}
            </div>
        </section>
    );
}

export function Accordion({
                              children,
                          }: {
    readonly children: React.ReactNode;
}) {
    return <div className="accordion">{children}</div>;
}
