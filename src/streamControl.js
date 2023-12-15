import React, { useState, useEffect, useRef } from 'react';
import './table.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


const StreamControl = (props) => {
    const [postsEventSource, setPostsEventSource] = useState(null);
    const [commentsEventSource, setCommentsEventSource] = useState(null);
    // Function to start streaming
    const parseTimestamp = (timestampString) => {
        return new Date(timestampString);
    };
    const getHourlyWindow = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() returns 0-11
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
    
        return `${year}-${month}-${day} ${hour}:00:00`;
    };

    const addToPostAggregation = (dataPoint) => {
        console.log(dataPoint);
        const timestamp = parseTimestamp(dataPoint.created);
        const hourlyWindow = getHourlyWindow(timestamp) // Unique number for the hourly window

        props.setAggregatedPosts(prevAggregatedPosts => {
            const newAggregatedPosts = new Map(prevAggregatedPosts);
    
            // Check if the hourly window key exists, if not, initialize it
            if (!newAggregatedPosts.has(hourlyWindow)) {
                newAggregatedPosts.set(hourlyWindow, {'title':[], 'author':[], 'body':[],'created':[],'id':[],'sentiment_scores': []});
            }

    
            // Update the value for the hourly window key
            const updatedTitles = [...newAggregatedPosts.get(hourlyWindow)["title"], dataPoint.title];
            const updatedAuthors = [...newAggregatedPosts.get(hourlyWindow)["author"], dataPoint.author];
            const updatedBodies = [...newAggregatedPosts.get(hourlyWindow)["body"], dataPoint.body];
            const updatedCreated = [...newAggregatedPosts.get(hourlyWindow)["created"], dataPoint.created];
            const updatedIds = [...newAggregatedPosts.get(hourlyWindow)["id"], dataPoint.id];
            const updatedScores = [...newAggregatedPosts.get(hourlyWindow)["sentiment_scores"], dataPoint.sentiment_score['compound']];
            newAggregatedPosts.set(hourlyWindow, { 'title':updatedTitles, 'author':updatedAuthors, 'body':updatedBodies,'created':updatedCreated,'id':updatedIds, 'sentiment_scores': updatedScores });
    
            // console.log("addToPost", newAggregatedPosts);
            return newAggregatedPosts;
        });
    };

    const addToCommentAggregation = (dataPoint) => {
        const timestamp = parseTimestamp(dataPoint.created);
        const hourlyWindow = getHourlyWindow(timestamp) // Unique number for the hourly window

        props.setAggregatedComments(prevAggregatedComments => {
            const newAggregatedComments = new Map(prevAggregatedComments);
    
            // Check if the hourly window key exists, if not, initialize it
            if (!newAggregatedComments.has(hourlyWindow)) {
                newAggregatedComments.set(hourlyWindow, {'title':[], 'author':[], 'body':[],'created':[],'id':[],'sentiment_scores': []});
            }
    
            // Update the value for the hourly window key
            const updatedTitles = [...newAggregatedComments.get(hourlyWindow)["title"], dataPoint.title];
            const updatedAuthors = [...newAggregatedComments.get(hourlyWindow)["author"], dataPoint.author];
            const updatedBodies = [...newAggregatedComments.get(hourlyWindow)["body"], dataPoint.body];
            const updatedCreated = [...newAggregatedComments.get(hourlyWindow)["created"], dataPoint.created];
            const updatedIds = [...newAggregatedComments.get(hourlyWindow)["id"], dataPoint.id];
            const updatedScores = [...newAggregatedComments.get(hourlyWindow)["sentiment_scores"], dataPoint.sentiment_score['compound']];
            newAggregatedComments.set(hourlyWindow,  { 'title':updatedTitles, 'author':updatedAuthors, 'body':updatedBodies,'created':updatedCreated,'id':updatedIds, 'sentiment_scores': updatedScores });
    
            // console.log("addToComments", newAggregatedComments);
            return newAggregatedComments;
        });
    };  

    const startStreaming = () => {
        props.setPostsData([]);
        props.setCommentsData([]);
        props.setAggregatedPosts(new Map());
        props.setAggregatedComments(new Map());
        props.setDPAggregatedPosts(new Map());
        props.setDPAggregatedComments(new Map());
        props.positiveCount.current = 0;
        props.negativeCount.current = 0;
        props.positiveDPCount.current = 0;
        props.negativeDPCount.current = 0;
        var epsilon = 1;
        var sensitivity_score = 1;
        if (!postsEventSource) {
            const newPostsEventSource = new EventSource(`http://localhost:4000/stream/posts?community=${props.subreddit}`);
            console.log("Post Stream setup");

            newPostsEventSource.onmessage = (event) => {
                const newData = JSON.parse(event.data);
                const newDPData = JSON.parse(event.data);
                if(newData.sentiment === 'Positive'){
                    props.positiveCount.current = props.positiveCount.current + 1;
                }
                else if(newData.sentiment === 'Negative'){
                    props.negativeCount.current = props.negativeCount.current + 1;
                }

                addToPostAggregation(newData);

                props.setPostsData(currentData => [{...newData, isNew: true}, ...currentData.map(d => ({...d, isNew: false}))]);
            };
            setPostsEventSource(newPostsEventSource);
        }
    // Comment Streaming below
        if (!commentsEventSource) {
            const newCommentsEventSource = new EventSource(`http://localhost:4000/stream/comments?community=${props.subreddit}`);
            console.log("Comment Stream setup");

            newCommentsEventSource.onmessage = (event) => {
                const newData = JSON.parse(event.data);
                const newDPData = JSON.parse(event.data);

                if(newData.sentiment === 'Positive'){
                    props.positiveCount.current = props.positiveCount.current + 1;
                }
                else if(newData.sentiment === 'Negative'){
                    props.negativeCount.current = props.negativeCount.current + 1;
                }

                addToCommentAggregation(newData);

                props.setCommentsData(currentData => [{...newData, isNew: true}, ...currentData.map(d => ({...d, isNew: false}))]);
            };
            setCommentsEventSource(newCommentsEventSource);
        }
    };

    // Function to stop streaming
    const stopStreaming = async () => {
        if (postsEventSource) {
            await fetch('http://localhost:4000/stream/stop-posts', { method: 'POST' });
            postsEventSource.close();
            setPostsEventSource(null);
        }

        if (commentsEventSource) {
            await fetch('http://localhost:4000/stream/stop-comments', { method: 'POST' });
            commentsEventSource.close();
            setCommentsEventSource(null);
        }

        // Send a request to the backend to stop streaming
    };

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            if (postsEventSource) {
                postsEventSource.close();
                console.log("Post Stream stopped")
            }
            if (commentsEventSource) {
                commentsEventSource.close();
                console.log("Comment Stream stopped")
            }
        };
    }, [postsEventSource, commentsEventSource]);

    const handleTextFieldChange = (event) => {
        props.setSubreddit(event.target.value);
    };
return (
    <div>
    <div style={{textAlign: '-webkit-center'}}>
    <button onClick={startStreaming}>Start Streaming</button>
    <button onClick={stopStreaming}>Stop Streaming</button>
    <Box
      sx={{
        width: 500,
        maxWidth: '100%',
        marginTop: '15px'
      }}
    >
      <TextField fullWidth label="Subreddit Community Name" id="subreddit_name" defaultValue={props.subreddit} onChange={handleTextFieldChange}/>
    </Box>
    </div>
    </div>
);
};

export default StreamControl;
