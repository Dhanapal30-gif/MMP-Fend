import { useEffect, useRef, useState } from 'react';

/**
 * Searchable multi-select dropdown (checkbox list).
 * Reuses the existing .product-dropdown / .ucd-filter-input styles.
 *
 * props:
 *  - options:      string[]          values to choose from
 *  - selected:     string[]          currently selected values
 *  - onChange:     (string[]) => void
 *  - allLabel:     text for the "select none / all" row and empty placeholder
 */
const MultiSelectDropdown = ({ options = [], selected = [], onChange, allLabel = "All" }) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };

  const summary =
    selected.length === 0 ? allLabel
    : selected.length === 1 ? selected[0]
    : `${selected[0]} +${selected.length - 1} more`;

  const q = search.toLowerCase();
  const visible = options.filter(o => o?.toString().toLowerCase().includes(q));

  return (
    <div className="product-dropdown" ref={wrapRef}>
      <input
        className={`ucd-filter-input${selected.length ? " ms-has-value" : ""}`}
        type="text"
        placeholder={summary}
        title={selected.join(", ")}
        value={search}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
      />
      {selected.length > 0 && (
        <span className="ms-count" title={selected.join(", ")}>{selected.length}</span>
      )}

      {open && (
        <div className="product-dropdown-menu">
          <div
            className={`product-dropdown-item ms-item${selected.length === 0 ? " ms-active" : ""}`}
            onClick={() => { onChange([]); setSearch(""); }}
          >
            <input type="checkbox" readOnly checked={selected.length === 0} tabIndex={-1} />
            <span>{allLabel}</span>
          </div>

          {visible.map((o) => {
            const checked = selected.includes(o);
            return (
              <div
                key={o}
                className={`product-dropdown-item ms-item${checked ? " ms-active" : ""}`}
                onClick={() => toggle(o)}
                title={o}
              >
                <input type="checkbox" readOnly checked={checked} tabIndex={-1} />
                <span>{o}</span>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="product-dropdown-item ms-empty">No matches</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
