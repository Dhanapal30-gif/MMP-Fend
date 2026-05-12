// import React from 'react';
// import { TextField } from "@mui/material";

// const IssuanceEditTable = ({ data, onChange }) => {
//   if (!data || data.length === 0) return <p style={{ color: "#888", padding: "10px" }}>No data</p>;

//   return (
//     <div style={{ overflowX: "auto", marginTop: "12px" }}>
//       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
//         <thead>
//           <tr style={{ background: "linear-gradient(90deg, #1c2a4a, #6d1b4e)", color: "white" }}>
//             <th style={thStyle}>Part Code</th>
//             <th style={thStyle}>Part Description</th>
//             <th style={thStyle}>Request Qty</th>
//             <th style={thStyle}>Issued Qty</th>
//             <th style={thStyle}>New Issued Qty</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row, idx) => (
//             <tr
//               key={idx}
//               style={{ backgroundColor: idx % 2 === 0 ? "#f9f0ff" : "#ffffff" }}
//             >
//               <td style={tdStyle}>{row.partcode}</td>
//               <td style={tdStyle}>{row.partdescription}</td>
//               <td style={{ ...tdStyle, fontWeight: "600", color: "#1c2a4a" }}>{row.reqQty}</td>
//               <td style={tdStyle}>
//                 <TextField
//                   type="number"
//                   size="small"
//                   value={row.issuedQty || ""}
//                   onChange={(e) => {
//                     const val = Number(e.target.value);
//                     const max = Number(row.reqQty || 0);
//                     if (val > max) return;
//                     onChange(idx, "issuedQty", e.target.value);
//                   }}
//                   style={{ width: "100px" }}
//                   inputProps={{ min: 0, max: row.reqQty }}
//                   error={Number(row.issuedQty) > Number(row.reqQty)}
//                   helperText={
//                     Number(row.issuedQty) > Number(row.reqQty)
//                       ? `Max: ${row.reqQty}`
//                       : ""
//                   }
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       "& fieldset": { borderColor: "#6d1b4e" },
//                       "&:hover fieldset": { borderColor: "#a3306e" },
//                       "&.Mui-focused fieldset": { borderColor: "#6d1b4e" },
//                     },
//                     "& input": { padding: "6px 10px", color: "#1c2a4a", fontWeight: "600" }
//                   }}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const thStyle = {
//   padding: "10px 14px",
//   textAlign: "left",
//   fontWeight: "600",
//   fontSize: "12px",
//   letterSpacing: "0.5px",
//   borderBottom: "2px solid #a3306e"
// };

// const tdStyle = {
//   padding: "10px 14px",
//   color: "#333",
//   borderBottom: "1px solid #e8d5f0"
// };

// export default IssuanceEditTable;



import React from 'react';
import { TextField } from "@mui/material";

const IssuanceEditTable = ({ data, onChange }) => {
  if (!data || data.length === 0)
    return <p style={{ color: "#888", padding: "10px" }}>No data</p>;

  return (
    <div style={{ overflowX: "auto", marginTop: "12px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "linear-gradient(90deg, #1c2a4a, #6d1b4e)", color: "white" }}>
            <th style={thStyle}>Part Code</th>
            <th style={thStyle}>Part Description</th>
            <th style={thStyle}>Request Qty</th>
            <th style={thStyle}>Issued Qty</th>
            <th style={thStyle}>New Issued Qty</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => {
            const issuedQty = Number(row.issuedQty || 0);
            const reqQty = Number(row.reqQty || 0);
            const newIssuedQty =
              row.newIssuedQty !== undefined ? row.newIssuedQty : issuedQty;

            return (
              <tr
                key={idx}
                style={{ backgroundColor: idx % 2 === 0 ? "#f9f0ff" : "#ffffff" }}
              >
                <td style={tdStyle}>{row.partcode}</td>
                <td style={tdStyle}>{row.partdescription}</td>

                <td style={{ ...tdStyle, fontWeight: "600", color: "#1c2a4a" }}>
                  {reqQty}
                </td>

                {/* 🔒 Issued Qty (Readonly) */}
                <td style={tdStyle}>
                  <TextField
                    type="number"
                    size="small"
                    value={issuedQty}
                    disabled
                    style={{ width: "100px" }}
                    sx={inputStyle}
                  />
                </td>

                {/* ✏️ New Issued Qty */}
                <td style={tdStyle}>
                  <TextField
  type="number"
  size="small"
  value={row.newIssuedQty ?? row.issuedQty ?? ""}
  onChange={(e) => {
    // ✅ just update, NO validation here
    onChange(idx, "newIssuedQty", e.target.value);
  }}
  onBlur={(e) => {
    let val = Number(e.target.value);
    const reqQty = Number(row.reqQty || 0);
    const issuedQty = Number(row.issuedQty || 0);

    if (!val && val !== 0) return;

    if (val > reqQty) {
      alert(`Max allowed is reqQty ${reqQty}`);
      onChange(idx, "newIssuedQty", issuedQty);
      return;
    }

    // if (val < issuedQty) {
    //   alert(`Allowed more than issuedqty ${issuedQty}`);
    //   onChange(idx, "newIssuedQty", issuedQty);
    //   return;
    // }
  }}
  inputProps={{ min: row.issuedQty, max: row.reqQty }}
/>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "10px 14px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "12px",
  letterSpacing: "0.5px",
  borderBottom: "2px solid #a3306e"
};

const tdStyle = {
  padding: "10px 14px",
  color: "#333",
  borderBottom: "1px solid #e8d5f0"
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#6d1b4e" },
    "&:hover fieldset": { borderColor: "#a3306e" },
    "&.Mui-focused fieldset": { borderColor: "#6d1b4e" },
  },
  "& input": {
    padding: "6px 10px",
    color: "#1c2a4a",
    fontWeight: "600"
  }
};

export default IssuanceEditTable;