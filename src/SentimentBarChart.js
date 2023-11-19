import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography } from '@mui/material';

export default function SentimentBarChart(positive, negative) {
    // Transform data for charting
    // const chartData = data.map((item, index) => ({
    //     id: `Entry ${index + 1}`, // Label each entry
    //     sentiment: item.sentiment,
    // }));

    return (
        <BarChart
        xAxis={[
            {
              id: 'barCategories',
              data: ['Positive', 'Negative'],
              scaleType: 'band',
            },
          ]}
          series={[
            {
              data: [positive.current, negative.current],
            },
          ]}
          width={500}
          height={300}
        />
    );
};

