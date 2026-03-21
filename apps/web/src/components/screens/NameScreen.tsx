import { useEffect, useState } from "react";
import { Section } from "../layout/Section";

type NameScreenProps = {
  readonly initialValue: string;
  readonly onSubmit: (name: string) => void;
  readonly onCancel: () => void;
};

export function NameScreen(props: NameScreenProps) {
  const { initialValue, onSubmit, onCancel } = props;

  const [name, setName] = useState<string>(initialValue);

  // sync with external state
  useEffect(() => {
    setName(initialValue);
  }, [initialValue]);

  const trimmedName = name.trim();
  const hasInitialValue = initialValue.trim().length > 0;

  const handleSubmit = (): void => {
    if (trimmedName.length === 0) {
      return;
    }

    onSubmit(trimmedName);
  };

  const handleCancel = (): void => {
    setName(initialValue); // rollback input
    onCancel();
  };

  return (
    <Section title="Enter name">
      <div className="name-screen">
        <input
          value={name}
          autoFocus
          onChange={(event) => setName(event.target.value)}
          placeholder="Type your name..."
          maxLength={24}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        <div className="actions">
          <button onClick={handleSubmit} disabled={trimmedName.length === 0}>
            Continue
          </button>

          {hasInitialValue && <button onClick={handleCancel}>Cancel</button>}
        </div>
      </div>
    </Section>
  );
}
