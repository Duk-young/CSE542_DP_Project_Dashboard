import React, { useState, useEffect, useRef } from 'react';
import StreamControl from './streamControl';
import CreateWordCloud from './wordCloudComponent';
import SentimentBarChart from './SentimentBarChart';
import renderCSVTable from './csvTable';
import LineChartComponent from './LineChartComponent';
import { style } from '@mui/system';
const App = () => {
  const [postsData, setPostsData] = useState([]); // State to store posts data
  const [commentsData, setCommentsData] = useState([]); // State to store comments data
  const [aggregatedPosts, setAggregatedPosts] = useState(new Map());
  const [aggregatedComments, setAggregatedComments] = useState(new Map());
  const [DPaggregatedPosts, setDPAggregatedPosts] = useState(new Map());
  const [DPaggregatedComments, setDPAggregatedComments] = useState(new Map());
  const [subreddit, setSubreddit] = useState("IsraelPalestine");
  const positiveCount = useRef(0);
  const negativeCount = useRef(0);
  const positiveDPCount = useRef(0);
  const negativeDPCount = useRef(0);
  // Function to handle streaming data

  return (
    <div>
    <div>
      <StreamControl subreddit={subreddit} setSubreddit={setSubreddit} setPostsData={setPostsData} setCommentsData={setCommentsData} aggregatedPosts={aggregatedPosts} setAggregatedPosts={setAggregatedPosts} aggregatedComments={aggregatedComments} setAggregatedComments={setAggregatedComments} DPaggregatedPosts={DPaggregatedPosts} DPaggregatedComments={DPaggregatedComments} setDPAggregatedPosts={setDPAggregatedPosts} setDPAggregatedComments={setDPAggregatedComments} positiveCount={positiveCount} negativeCount={negativeCount} positiveDPCount={positiveDPCount} negativeDPCount={negativeDPCount}/>
          </div>
    <div style={{ display: 'flex', marginBottom: '20px' }}> {/* Added marginBottom for spacing between rows */}
      <div style={{ flex: 1, padding: '10px' }}>
        <h2>Posts (No DP)</h2>
        {renderCSVTable(postsData, 'posts')}
      </div>
      <div style={{ flex: 1, padding: '10px' }}>
        <h2>Comments (No DP)</h2>
        {renderCSVTable(commentsData, 'comments')}
      </div>
    </div>

    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: '10px' ,marginBottom:'20px'}}>
        <h2>Overall Sentiment Distribution of {subreddit}</h2>
        {SentimentBarChart(aggregatedPosts, aggregatedComments)}
      </div>
      <div style={{ flex: 1, padding: '10px',marginBottom:'20px' }}>
        <h2>Wordcloud of {subreddit}</h2>
        {CreateWordCloud(postsData, commentsData, 700, 500, false)}
      </div>
    </div>
      {LineChartComponent (aggregatedPosts, aggregatedComments)}
    </div> 
  );
};

export default App;
