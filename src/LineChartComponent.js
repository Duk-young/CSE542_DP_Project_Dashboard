import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar  } from 'react-chartjs-2';
import { BarChart } from '@mui/x-charts/BarChart';
import renderCSVTable from './csvTable';
import renderInferenceTable from './inferenceTable';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, BarElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
function findCloseIndex(target, arr, absTol) {
  for (let i = 0; i < arr.length; i++) {
      if (Math.abs(arr[i] - target) <= absTol) {
          return i;
      }
  }
  return -1; // Return -1 if no close element is found
}
const LineChartComponent = ( posts, comments ) => {
    const [epsilon, setEpsilon] = useState(1);
    const [utilityLoss, setUtilityLoss] = useState(0);
    const [mse, setMSE] = useState(0);
    const [target, setTarget] = useState([]);
    const [inferences, setInferences] = useState([]);
    const [chartSize, setChartSize] = useState({ width: window.innerWidth * 0.5, height: 500 });
    const [lineChartData, setLineChartData] = useState({
      labels: [], // your labels here
      datasets: [
          {
              label: 'Your Label',
              data: [], // your data here
              borderColor: 'rgba(0, 0, 0, 1)',
              borderWidth: 2,
              fill: false,
              lineTension: 0,
              stepped: true, // This enables the step effect
              pointRadius: 0 // Set the point radius to 0 to hide the points
          },
      ],
  });
    const [barChartData, setBarChartData] = useState({
      xAxis: [
        {
          id: 'dp-applied',
          data: [0],
          scaleType: 'band',
        },
      ],
      series: [
        {
          data: [0], 
        },
      ],
    });
    const options = {
      scales: {
          y: {
              beginAtZero: false
          },
          x: {
              type: 'linear', // Ensure you have a linear scale for continuous data
              position: 'bottom'
          }
      },
      elements: {
          line: {
              tension: 0 // Disables bezier curves
          }
      },
      plugins: {
          legend: {
              display: false // Set to false or true depending on your need
          }
      }
  };
  useEffect(() => {
    // Function to update width and height
    const handleResize = () => {
        setChartSize({ width: window.innerWidth * 0.5, height: 300 });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call the handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
    const labels = Array.from(posts.entries()).slice(-10).map((entry) => entry[0]);
    const createBins = (data, binSize) => {
      const max = Math.max(...data);
      const min = Math.min(...data);
  
      // Determine the furthest extent in either direction, rounded up to the nearest bin edge
      const extent = Math.ceil(Math.max(Math.abs(max), Math.abs(min)) / binSize) * binSize;
  
      // Calculate the number of bins required for both positive and negative ranges
      const binCount = Math.ceil(extent / binSize) * 2;
      console.log(binCount);
      const bins = new Array(binCount).fill(0);
  
      data.forEach(val => {
          // Shift the value to ensure the zero-centered bins
          const shiftedVal = val + extent;
          const binIndex = Math.floor(shiftedVal / binSize);
          bins[binIndex]++;
      });
      const labels = new Array(binCount).fill(0).map((_, index) => {
          const lower = -extent + index * binSize;
          const upper = lower + binSize;
          return `${lower.toFixed(2)} to ${upper.toFixed(2)}`;
      });
  
      return { bins, labels };
  };
  
  const range = [];
    for (let i = -1; i <= 1; i += 0.1) {
      range.push(parseFloat(i.toFixed(1))); 
    }
    const sentimentCounts = new Array(range.length).fill(0);
    const getIndex = (value) => {
      return Math.round((value + 1) / 0.1);
  };

  const processSentiments = (items) => {
    const dpPreprocess = [];
    for (var i = 0; i < range.length; i++) {
      dpPreprocess.push([]);
    }
      items.forEach(scores => {
        scores.forEach(value =>{
          const index = getIndex(value);
          if (index >= 0 && index < sentimentCounts.length) {
              sentimentCounts[index] += 1;
              dpPreprocess[index].push(1);
          }
        })
      });
      fetch('http://localhost:4000/stream/apply-dp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'dataset': dpPreprocess,
            'epsilon': epsilon,
            'sensitivity': 1
        })
      })
      .then(response => response.json())
      .then(dp_output => {
        console.log("apply-dp", dp_output);
        setBarChartData(prevData => ({
          ...prevData,
          xAxis:[
            {
              id: 'dp-applied',
              data: range,
              scaleType: 'band',
            },
          ],
          series: [{ data: sentimentCounts, label: 'No DP' },{data:dp_output.dp_histogram, label:'DP with ε = ' + epsilon}]
        }));
        setUtilityLoss(dp_output.tvd);
        setMSE(dp_output.mse);
      })
      .catch(error => console.error('Error:', error));
  }

    const handleInputChange = (e) => {
      setEpsilon(e.target.value);
    };
    const handleButtonClick = () => {
      var merged = new Map();

      labels.forEach((key) =>{
        const mergedValues = []
        const postData = posts.get(key);
        const commentData = comments.get(key);
        if (postData && typeof postData.sentiment_scores !== 'undefined') {
          mergedValues.push(...postData.sentiment_scores);
        }
      
        if (commentData && typeof commentData.sentiment_scores !== 'undefined') {
          mergedValues.push(...commentData.sentiment_scores);
        }
        merged.set(key, mergedValues);
      })
      var mergedSentimentScores = Array.from(merged.values());
      processSentiments(mergedSentimentScores);
      fetch('http://localhost:4000/stream/privacy-loss', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'dataset': mergedSentimentScores,
            'epsilon': epsilon,
            'sensitivity': 1
        })
      })
      .then(response => response.json())
      .then(data => {
        setTarget([]);
        setInferences([]);
        console.log("data",data);
        console.log("Infer member:", data.infer_member);
        const maxLength = Math.max(posts.length, comments.length);
        var targ = {}
        for(var i = 0; i < labels.length; i++){
          const postData = posts.get(labels[i]);
          const commentData = comments.get(labels[i]);
          if (postData && postData.sentiment_scores.includes(data.infer_member)) {
            const index = postData.sentiment_scores.indexOf(data.infer_member);
            const t = {'title':postData.title[index], 'author':postData.author[index], 'body':postData.body[index], 'created':postData.created[index],'id':postData.id[index],'sentiment_score':postData.sentiment_scores[index]};
            targ = t;
            setTarget([t]);
            break;
          }
        
          if (commentData && commentData.sentiment_scores.includes(data.infer_member)) {
            const index = commentData.sentiment_scores.indexOf(data.infer_member);
            const t = {'title':commentData.title[index], 'author':commentData.author[index], 'body':commentData.body[index], 'created':commentData.created[index],'id':commentData.id[index],'sentiment_score':commentData.sentiment_scores[index]};
            targ = t;
            setTarget([t]);
            break;
          }
        }
        for(var i = 0; i < data.inferences.length; i++){
          const inference = data.inferences[i];
          for(var j = 0; j < labels.length; j++){
            var postData = posts.get(labels[j]) || {'sentiment_scores': []};
            var commentData = comments.get(labels[j]) || {'sentiment_scores': []};
            const postIndex = findCloseIndex(inference,postData.sentiment_scores,0.001);
            const commentIndex = findCloseIndex(inference,commentData.sentiment_scores,0.001);
            if (postData && postIndex !== -1) {
              var success = 'False';
              if(targ.id === postData.id[postIndex] && targ.sentiment_score === postData.sentiment_scores[postIndex]){
                success = 'True';
              }
              const t = {'inference':success, 'title':postData.title[postIndex], 'author':postData.author[postIndex], 'body':postData.body[postIndex], 'created':postData.created[postIndex],'id':postData.id[postIndex],'sentiment_score':postData.sentiment_scores[postIndex]};
              // const updateInferences = [...inferences, t];
              setInferences(prevInferences => [...prevInferences, t]);
            }
            else if (commentData && commentIndex !== -1) {
              console.log(commentIndex);
              console.log(commentData);
              var success = 'False';
              if(targ.id === commentData.id[commentIndex] && targ.sentiment_score === commentData.sentiment_scores[commentIndex]){
                success = 'True';
              }
              const t = {'inference':success, 'title':commentData.title[commentIndex], 'author':commentData.author[commentIndex], 'body':commentData.body[commentIndex], 'created':commentData.created[commentIndex],'id':commentData.id[commentIndex],'sentiment_score':commentData.sentiment_scores[commentIndex]};
              // const updateInferences = [...inferences, t];
              setInferences(prevInferences => [...prevInferences, t]);
            }
            // else{
            //   const t = {'inference':false, 'title':'No match', 'author':'No match', 'body':'No match', 'created':'No match','id':'No match','sentiment_score':inference};
            //   inferences.push(t);
            // }
          }
        }
        console.log("Target:",target);
        console.log("Inferences",inferences);
        const newLabels = data.privacy_loss.map((_, index) => index);
        setLineChartData({
          labels: newLabels,
          datasets: [
              {
                  label: 'Privacy Loss when ε = ' + epsilon,
                  data: data.privacy_loss, // The probability distribution data
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 2,
                  fill: false,
                  lineTension: 0,
                  steppedLine: true, // This enables the step effect
                  pointRadius: 0 // Set the point radius to 0 to hide the points
              },
          ],
      });

      })
      .catch(error => console.error('Error:', error));
    };
      
    return(
    <>
    <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: '10px',marginBottom:'20px' }}>
    <h2>Application of DP with Laplace Noise</h2>
    <label>
      Epsilon =&nbsp;
    <input 
              type="number" 
              step="0.1" 
              value={epsilon} 
              onChange={handleInputChange}
          />
    </label>
    <button onClick={handleButtonClick}>Send</button>
    <BarChart
          xAxis={barChartData.xAxis}
          series={barChartData.series}
          width={chartSize.width}
          height={chartSize.height}
        />
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
        <p style={{ marginRight: '20px' }}>Utility Loss: {utilityLoss * 100}%</p>
        <p style={{ marginRight: '20px' }}>MSE: {mse}</p>
        <p>P[A(D1)=O]≤ e^ε ⋅ P[A(D2)=O]</p>
    </div>
    </div>
    <div style={{ flex: 1, padding: '10px',marginBottom:'20px' }}>
    <h2>Privacy Loss Random Variable Distribution</h2>
    <Line data={lineChartData} options={options} width={chartSize.width} height={chartSize.height} /> 
    </div>
    </div>
    <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: '10px',marginBottom:'20px' }}>
    <h2>Target</h2>
    {renderInferenceTable(target, 'target')}
  </div>

  {/* Separate row for the Comments (No DP) table */}
  <div style={{ flex: 1, padding: '10px',marginBottom:'20px' }}>
    <h2>Inferences</h2>
    {renderInferenceTable(inferences, 'inferences')}
  </div>
  </div>
    </>);
};

export default LineChartComponent;
