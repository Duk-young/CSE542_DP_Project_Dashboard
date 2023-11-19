import React, { useState, useEffect, useRef } from 'react';
import StreamControl from './streamControl';
import WordCloudComponent from './wordCloudComponent';
import SentimentBarChart from './SentimentBarChart';
import renderCSVTable from './csvTable';
const App = () => {
  const [postsData, setPostsData] = useState([]); // State to store posts data
  const [commentsData, setCommentsData] = useState([]); // State to store comments data
  const [postsDPData, setPostsDPData] = useState([]); // State to store posts data
  const [commentsDPData, setCommentsDPData] = useState([]); // State to store comments data
  const positiveCount = useRef(0);
  const negativeCount = useRef(0);
  const positiveDPCount = useRef(0);
  const negativeDPCount = useRef(0);
  // Function to handle streaming data

  return (
    <div>
    <div>
      {/* <CSVTable data={csvData} /> */}
      <StreamControl setPostsData={setPostsData} setCommentsData={setCommentsData} setPostsDPData={setPostsDPData} setCommentsDPData={setCommentsDPData} positiveCount={positiveCount} negativeCount={negativeCount} positiveDPCount={positiveDPCount} negativeDPCount={negativeDPCount}/>
      {/* <StatisticalGraph data={graphData} />
      <WordCloudComponent words={wordCloudData} /> */}
          </div>
     <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '10px' }}>
            <h2>Posts (No DP)</h2>
            {renderCSVTable(postsData, 'posts')}
            <h2>Comments (No DP)</h2>
            {renderCSVTable(commentsData, 'comments')}
            {SentimentBarChart(positiveCount, negativeCount)}
        </div>

        <div style={{ flex: 1, padding: '10px' }}>
            <h2>Posts (DP)</h2>
            {renderCSVTable(postsDPData, 'posts')}
            <h2>Comments (DP)</h2>
            {renderCSVTable(commentsDPData, 'comments')}
            {SentimentBarChart(positiveDPCount, negativeDPCount)}
        </div>
    </div> 
    </div>
  );
};

export default App;
