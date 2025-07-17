import * as React from 'react';
import { FixedSizeList } from 'react-window';

const LISTBOX_PADDING = 8;

const renderRow = ({ data, index, style }) => {
  const option = data[index];
  return (
    <li
      {...option.props}
      style={{
        ...style,
        top: style.top + LISTBOX_PADDING,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        padding: "8px 12px",
        fontSize: "14px", // ✅ your desired font size
        fontFamily: "Arial, sans-serif", // ✅ your font
        lineHeight: "1.4", // ✅ ensures proper spacing
        boxSizing: "border-box",
      }}
      title={option.props.children}
    >
      {option.props.children}
    </li>
  );
};


const DropdownCom = React.forwardRef(function DropdownCom(props, ref) {
  const { children, ...other } = props;
  const itemData = [];

  React.Children.forEach(children, (child) => {
    itemData.push(child);
  });

  const itemCount = itemData.length;
  const itemSize = 39;

  return (
    <div ref={ref} {...other}>
      <FixedSizeList
        height={300}
        width="100%"
        itemSize={itemSize}
        itemCount={itemCount}
        itemData={itemData}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </div>
  );
});

export default DropdownCom;
