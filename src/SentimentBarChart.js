import React, {useEffect, useState} from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography } from '@mui/material';

export default function SentimentBarChart(posts, comments) {
    const [dynamicWidth, setDynamicWidth] = useState(window.innerWidth * 0.5);
    // Transform data for charting
    // const chartData = data.map((item, index) => ({
    //     id: `Entry ${index + 1}`, // Label each entry
    //     sentiment: item.sentiment,
    // }));
    // console.log("barChart", posts);
    const options = {
      plugins: {
          title: {
              display: true,
              text: 'Overall Sentiment Distribution', // Graph title
              font: {
                  size: 24
              }
          },
          legend: {
              display: true, // Show legend
              position: 'top', // Position of the legend
          }
      },
      scales: {
          y: {
              beginAtZero: true
          }
      }
  };
    const range = [];
    for (let i = -1; i <= 1; i += 0.1) {
      range.push(parseFloat(i.toFixed(1))); 
    }
    const sentimentCounts = new Array(range.length).fill(0);
    const getIndex = (value) => {
      // Map the value to a 0-20 range and round to nearest integer
      // console.log(value,"=>",Math.round((value + 1) / 0.1));
      return Math.round((value + 1) / 0.1);
  };
  useEffect(() => {
    // Function to update width
    const handleResize = () => {
      setDynamicWidth(window.innerWidth * 0.5);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call the handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const processSentiments = (items) => {
      items.forEach(scores => {
        scores.sentiment_scores.forEach(value =>{
          // console.log("value=",value);
          const index = getIndex(value);
          if (index >= 0 && index < sentimentCounts.length) {
              sentimentCounts[index] += 1;
          }
        })
      });
  }
    // Process posts and comments
    processSentiments(posts);
    processSentiments(comments);
    // console.log(sentimentCounts);
    return (
        <BarChart
        options={options}
        xAxis={[
            {
              id: 'overall',
              data: range,
              scaleType: 'band',
            },
          ]}
          series={[
            {
              label:"Sentiments with no DP",
              data: sentimentCounts,
            },
          ]}
          width={dynamicWidth}
          height={500}
        />
    );
};

