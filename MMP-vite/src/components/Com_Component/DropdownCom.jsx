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
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        padding: '8px 12px',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.4',
        boxSizing: 'border-box',
      }}
      title={option.props.children}
    >
      {option.props.children}
    </li>
  );
};

const DropdownCom = React.forwardRef(function DropdownCom(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);

  const itemCount = itemData.length;
  const itemSize = 39;

  return (
    <div
      ref={ref}
      {...other}
      style={{
        overflow: 'hidden', // ✅ prevent outer scrollbars
      }}
    >
      <FixedSizeList
        height={300}
        width="100%"
        itemSize={itemSize}
        itemCount={itemCount}
        itemData={itemData}
        overscanCount={5}
        style={{
          overflowX: 'hidden', // ✅ block horizontal scroll
        }}
      >
        {renderRow}
      </FixedSizeList>
    </div>
  );
});

export default DropdownCom;
