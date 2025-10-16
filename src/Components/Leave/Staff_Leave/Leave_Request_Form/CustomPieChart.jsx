import React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

// Custom component to add connecting lines
const ConnectingLines = ({ data, colors, chartWidth = 400, chartHeight = 400 }) => {
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;
  const radius = 130;
  
  // Calculate positions for each segment
  let currentAngle = -90; // Start from top
  
  const segmentPositions = data.map((item, index) => {
    const angle = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 360;
    const midAngle = currentAngle + angle / 2;
    const x = centerX + Math.cos((midAngle * Math.PI) / 180) * radius;
    const y = centerY + Math.sin((midAngle * Math.PI) / 180) * radius;
    
    currentAngle += angle;
    
    return {
      x,
      y,
      label: item.label,
      color: colors[index % colors.length],
      percentage: item.percentage
    };
  });

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {segmentPositions.map((segment, index) => {
        // Calculate label position (outside the chart area)
        const labelX = segment.x > centerX ? chartWidth - 20 : 20;
        const labelY = segment.y;
        
        // Calculate line path
        const lineX = segment.x > centerX ? segment.x + 20 : segment.x - 20;
        const lineY = segment.y;
        
        return (
          <g key={index}>
            {/* Connecting line */}
            <line
              x1={segment.x}
              y1={segment.y}
              x2={lineX}
              y2={lineY}
              stroke="#666"
              strokeWidth="2"
            />
            {/* Horizontal line to label */}
            <line
              x1={lineX}
              y1={lineY}
              x2={labelX}
              y2={lineY}
              stroke="#666"
              strokeWidth="2"
            />
            {/* Label circle */}
            <circle
              cx={labelX}
              cy={labelY}
              r="8"
              fill={segment.color}
            />
            {/* Label text */}
            <text
              x={labelX + (segment.x > centerX ? 15 : -15)}
              y={labelY}
              textAnchor={segment.x > centerX ? 'start' : 'end'}
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="bold"
              fill={segment.color}
            >
              {segment.label}
            </text>
            {/* Percentage text */}
            <text
              x={labelX + (segment.x > centerX ? 15 : -15)}
              y={labelY + 15}
              textAnchor={segment.x > centerX ? 'start' : 'end'}
              dominantBaseline="middle"
              fontSize="10"
              fill="#666"
            >
              {segment.percentage.toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const CustomPieChart = ({ data, colors, title, chartWidth = 400, chartHeight = 400 }) => {
  return (
    <Box sx={{ position: 'relative', width: chartWidth, height: chartHeight }}>
      <PieChart
        series={[
          {
            innerRadius: 60,
            outerRadius: 130,
            data: data,
            highlightScope: { fade: 'global', highlight: 'item' },
            highlighted: { additionalRadius: 4 },
            cornerRadius: 6,
          },
        ]}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: { display: 'none' }, // Hide default labels
        }}
        slotProps={{
          legend: { hidden: true }, // Hide default legend
        }}
        width={chartWidth}
        height={chartHeight}
      >
        <PieCenterLabel>{title}</PieCenterLabel>
      </PieChart>
      <ConnectingLines 
        data={data} 
        colors={colors} 
        chartWidth={chartWidth} 
        chartHeight={chartHeight} 
      />
    </Box>
  );
};

export default CustomPieChart;

