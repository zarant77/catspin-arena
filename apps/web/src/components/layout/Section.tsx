import type { ReactNode } from "react";

type SectionProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly actions?: ReactNode;
};

export function Section({ title, children, actions }: SectionProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>

        {actions ? <div className="section-actions">{actions}</div> : null}
      </div>

      <div className="section-content">{children}</div>
    </section>
  );
}
