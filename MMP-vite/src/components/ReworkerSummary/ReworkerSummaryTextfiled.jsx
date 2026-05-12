// import React, { useState } from "react";


// const ReworkerSummaryTextfiled = ({ label, options = [],onChange }) => {
//     const [open, setOpen] = useState(false);
//     const [search, setSearch] = useState("");
//     const [selected, setSelected] = useState("");

//     const filteredOptions = options.filter((item) =>
//         item?.toLowerCase().includes(search.toLowerCase())
//     );

//     const handleSelect = (value) => {
//         setSelected(value);
//         setOpen(false);
//         setSearch("");
//            onChange && onChange(value);   // ✅ add this
//     };

//     return (
//         <div
//             className="reworkerdropdown-container"
//             onMouseEnter={() => setOpen(true)}
//             onMouseLeave={() => {
//                 setOpen(false);
//                 setSearch("");
//             }}
//         >
//             {/* Label */}
//             <div className="reworkerdropdown-label">{label}</div>

//             {/* Dropdown */}
//             {open && (
//                 <div className="reworkerdropdown-menu">

//                     <input
//                         type="text"
//                         placeholder="Search..."
//                         className="reworkerdropdown-search"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                     />

//                     {filteredOptions.length > 0 ? (
//                         filteredOptions.map((item, index) => (
//                             <div
//                                 key={index}
//                                 className="dropdown-item"
//                                 onClick={() => handleSelect(item)}
//                             >
//                                 {item}
//                             </div>
//                         ))
//                     ) : (
//                         <div className="dropdown-item">No Data</div>
//                     )}
//                 </div>
//             )}

//             {/* ✅ Selected value shown below */}
//             {selected && (
//                 <div className="selected-value">
//                     {selected}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ReworkerSummaryTextfiled;



import React, { useState } from "react";

const ReworkerSummaryTextfiled = ({ label, options = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");

  const isLargeList = options.length > 100;

  const filteredOptions = isLargeList
    ? search.length >= 2
      ? options.filter(item => item?.toLowerCase().includes(search.toLowerCase())).slice(0, 50)
      : []
    : options.filter(item => item?.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (value) => {
    setSelected(value);
    setOpen(false);
    setSearch("");
    onChange && onChange(value);
  };

  return (
    <div
      className="reworkerdropdown-container"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setSearch(""); }}
    >
      <div className="reworkerdropdown-label">{label}</div>

      {open && (
        <div className="reworkerdropdown-menu">
          <input
            type="text"
            placeholder={isLargeList ? "Type 2+ chars..." : "Search..."}
            className="reworkerdropdown-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {isLargeList && search.length < 2 ? (
            <div className="dropdown-item" style={{ color: '#94A3B8', fontSize: 11 }}>
              Type 2+ chars to search
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((item, index) => (
              <div key={index} className="dropdown-item" onClick={() => handleSelect(item)}>
                {item}
              </div>
            ))
          ) : (
            <div className="dropdown-item">No Data</div>
          )}
        </div>
      )}

      {selected && <div className="selected-value">{selected}</div>}
    </div>
  );
};

export default ReworkerSummaryTextfiled;