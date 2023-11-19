import React, { useState, useEffect, useRef } from 'react';
import './table.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


const StreamControl = (props) => {
    const [postsEventSource, setPostsEventSource] = useState(null);
    const [commentsEventSource, setCommentsEventSource] = useState(null);

    // Function to start streaming
    const startStreaming = () => {
        props.setPostsData([]);
        props.setCommentsData([]);
        props.setPostsDPData([]);
        props.setCommentsDPData([]);
        props.positiveCount.current = 0;
        props.negativeCount.current = 0;
        props.positiveDPCount.current = 0;
        props.negativeDPCount.current = 0;
        var epsilon = 1;
        var sensitivity_score = 1;
        if (!postsEventSource) {
            const newPostsEventSource = new EventSource('http://localhost:4000/stream/posts');
            console.log("Post Stream setup");
            newPostsEventSource.onmessage = (event) => {
                const newData = JSON.parse(event.data);
                const newDPData = JSON.parse(event.data);
                // // Handle the new data (e.g., updating state or props)
                if(newData.sentiment === 'Positive'){
                    props.positiveCount.current = props.positiveCount.current + 1;
                }
                else if(newData.sentiment === 'Negative'){
                    props.negativeCount.current = props.negativeCount.current + 1;
                }
                props.setPostsData(currentData => [{...newData, isNew: true}, ...currentData.map(d => ({...d, isNew: false}))]);
                fetch('http://localhost:4000/stream/apply-dp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'sentiment_score': newDPData['sentiment_score'],
                        'epsilon': epsilon,
                        'sensitivity_score': sensitivity_score
                    })
                })
                .then(response => response.json())
                .then(data => {
                    newDPData['sentiment_score'] = data; // Assuming the response contains the data you need
                    newDPData['sentiment'] = data['compound'] > 0 ? 'Positive' : 'Negative';
                    if(newDPData['sentiment']  === 'Positive'){
                        props.positiveDPCount.current = props.positiveDPCount.current + 1;
                    }
                    else if(newDPData['sentiment']  === 'Negative'){
                        props.negativeDPCount.current = props.negativeDPCount.current + 1;
                    }
                    props.setPostsDPData(currentData => [{...newDPData, isNew: true}, ...currentData.map(d => ({...d, isNew: false}))]);
                    console.log('New post data:', newDPData['sentiment_score']);
                })
                .catch(error => console.error('Error:', error));
                // console.log('New post data:', newDPData['sentiment_score']);
            };
            setPostsEventSource(newPostsEventSource);
        }

        if (!commentsEventSource) {
            const newCommentsEventSource = new EventSource('http://localhost:4000/stream/comments');
            console.log("Comment Stream setup");
            newCommentsEventSource.onmessage = (event) => {
                const newData = JSON.parse(event.data);
                const newDPData = JSON.parse(event.data);
                // // Handle the new data (e.g., updating state or props)
                if(newData.sentiment === 'Positive'){
                    props.positiveCount.current = props.positiveCount.current + 1;
                }
                else if(newData.sentiment === 'Negative'){
                    props.negativeCount.current = props.negativeCount.current + 1;
                }
                props.setCommentsData(currentData => [{...newData, isNew: true}, ...currentData.map(d => ({...d, isNew: false}))]);
                fetch('http://localhost:4000/stream/apply-dp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'sentiment_score': newDPData['sentiment_score'],
                        'epsilon': epsilon,
                        'sensitivity_score': sensitivity_score
                    })
                })
                .then(response => response.json())
                .then(data => {
                    newDPData['sentiment_score'] = data; // Assuming the response contains the data you need
                    newDPData['sentiment'] = data['compound'] > 0 ? 'Positive' : 'Negative';
                    console.log("DP Sentiment:", data)
                    if(newDPData['sentiment'] === 'Positive'){
                        props.positiveDPCount.current = props.positiveDPCount.current + 1;
                    }
                    else if(newDPData['sentiment'] === 'Negative'){
                        props.negativeDPCount.current = props.negativeDPCount.current + 1;
                    }
                    props.setCommentsDPData(currentData => [{...newDPData, isNew: true}, ...currentData.map(d => ({...d, isNew: false}))]);
                    console.log('New post data:', newDPData['sentiment_score']);
                })
                .catch(error => console.error('Error:', error));
                // console.log('New comment data:', event.data);
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

// Function to render CSV tables
// const renderCSVTable = (data, dataType) => {
//     return (
//         <TableContainer component={Paper} className="scroll-table">
//             <Table stickyHeader>
//                 <TableHead>
//                     <TableRow>
//                         <TableCell>Title</TableCell>
//                         {/* <TableCell>URL</TableCell> */}
//                         {/* <TableCell>Total Comments</TableCell> */}
//                         <TableCell>Author</TableCell>
//                         <TableCell>Body</TableCell>
//                         <TableCell>Sentiment</TableCell>
//                         <TableCell>Sentiment Score</TableCell>
//                         <TableCell>Created</TableCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     {data.map((item, index) => (
//                         <TableRow key={`${item.id}`} className={item.isNew ? "new-row" : ""}>
//                             <TableCell>{item.title}</TableCell>
//                             {/* <TableCell>{dataType === 'posts' ? item.url : 'N/A'}</TableCell> */}
//                             {/* <TableCell>{dataType === 'posts' ? item.total_comments : 'N/A'}</TableCell> */}
//                             <TableCell>{item.author}</TableCell>
//                             <TableCell>{item.body}</TableCell>
//                             <TableCell>{item.sentiment}</TableCell>
//                             <TableCell>{item.sentiment === 'Positive' ? item.sentiment_score['pos'] : item.sentiment === 'Negative' ? item.sentiment_score['neg'] : item.sentiment_score['neu']}</TableCell>
//                             <TableCell>{item.created}</TableCell>
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//         </TableContainer>
//     );
// };

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
      <TextField fullWidth label="Subreddit Community Name" id="subreddit_name" defaultValue={'IsarelPalestine'}/>
    </Box>
    </div>
    {/* <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '10px' }}>
            <h2>Posts (No DP)</h2>
            {renderCSVTable(postsData, 'posts')}
            <h2>Comments (No DP)</h2>
            {renderCSVTable(commentsData, 'comments')}
            {SentimentBarChart(positiveCount, negativeCount)}
        </div>

        <div style={{ flex: 1, padding: '10px' }}>
            <h2>Posts (DP)</h2>
            {renderCSVTable(postsData, 'posts')}
            <h2>Comments (DP)</h2>
            {renderCSVTable(commentsData, 'comments')}
            {SentimentBarChart(positiveCount, negativeCount)}
        </div>
    </div> */}
    </div>
);
};

export default StreamControl;
