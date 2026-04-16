import React, { useState } from "react";


const ReworkerSummaryTextfiled = ({ label, options = [],onChange }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState("");

    const filteredOptions = options.filter((item) =>
        item?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (value) => {
        setSelected(value);
        setOpen(false);
        setSearch("");
           onChange && onChange(value);   // ✅ add this
    };

    return (
        <div
            className="reworkerdropdown-container"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => {
                setOpen(false);
                setSearch("");
            }}
        >
            {/* Label */}
            <div className="reworkerdropdown-label">{label}</div>

            {/* Dropdown */}
            {open && (
                <div className="reworkerdropdown-menu">

                    <input
                        type="text"
                        placeholder="Search..."
                        className="reworkerdropdown-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((item, index) => (
                            <div
                                key={index}
                                className="dropdown-item"
                                onClick={() => handleSelect(item)}
                            >
                                {item}
                            </div>
                        ))
                    ) : (
                        <div className="dropdown-item">No Data</div>
                    )}
                </div>
            )}

            {/* ✅ Selected value shown below */}
            {selected && (
                <div className="selected-value">
                    {selected}
                </div>
            )}
        </div>
    );
};

export default ReworkerSummaryTextfiled;