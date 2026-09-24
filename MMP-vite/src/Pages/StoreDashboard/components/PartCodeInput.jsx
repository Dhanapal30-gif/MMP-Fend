import React, { useEffect, useId, useState } from "react";

const ALL_LABEL = "All Part Codes";

// Part code filter that accepts typing or pasting, and narrows the
// dropdown suggestions as you type.
//
// The filter is applied (onChange) when:
//   - the text exactly matches a known part code (typed, pasted or picked)
//   - the text is cleared / "All Part Codes"
//   - the user presses Enter or leaves the field (any pasted code, even one
//     that is not in the loaded list)
// so we don't fire an API request on every keystroke.
const PartCodeInput = ({ value, onChange, partCodes = [] }) => {
  const listId = useId();
  const [draft, setDraft] = useState(value ?? "");

  // Keep the box in sync if the parent changes the value.
  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const options = partCodes.filter((code) => code !== ALL_LABEL);

  const commit = (text) => {
    const trimmed = text.trim();
    const next = trimmed.toLowerCase() === ALL_LABEL.toLowerCase() ? "" : trimmed;

    // Use the exact casing from the list when the text matches one.
    const match = options.find(
      (code) => code.toLowerCase() === next.toLowerCase()
    );

    const finalValue = match ?? next;

    setDraft(finalValue);
    if (finalValue !== (value ?? "")) onChange(finalValue);
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setDraft(text);

    const trimmed = text.trim();
    const isKnown = options.some(
      (code) => code.toLowerCase() === trimmed.toLowerCase()
    );

    if (trimmed === "" || isKnown) commit(text);
  };

  return (
    <>
      <input
        type="text"
        list={listId}
        value={draft}
        placeholder={ALL_LABEL}
        autoComplete="off"
        spellCheck={false}
        onChange={handleChange}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
        }}
      />

      <datalist id={listId}>
        {options.map((code) => (
          <option key={code} value={code} />
        ))}
      </datalist>
    </>
  );
};

export default PartCodeInput;
