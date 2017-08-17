import React from 'react';

const CustomizedLabel = ({ x, y, stroke, value }) => (
  <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">{value}</text>
);

export default CustomizedLabel;
