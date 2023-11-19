import React from 'react';
import Papa from 'papaparse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import './table.css';

// Function to render CSV tables
 const renderCSVTable = (data, dataType) => {
    return (
        <TableContainer component={Paper} className="scroll-table">
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        {/* <TableCell>URL</TableCell> */}
                        {/* <TableCell>Total Comments</TableCell> */}
                        <TableCell>Author</TableCell>
                        <TableCell>Body</TableCell>
                        <TableCell>Sentiment</TableCell>
                        <TableCell>Sentiment Score</TableCell>
                        <TableCell>Created</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={`${item.id}`} className={item.isNew ? "new-row" : ""}>
                            <TableCell>{item.title}</TableCell>
                            {/* <TableCell>{dataType === 'posts' ? item.url : 'N/A'}</TableCell> */}
                            {/* <TableCell>{dataType === 'posts' ? item.total_comments : 'N/A'}</TableCell> */}
                            <TableCell>{item.author}</TableCell>
                            <TableCell>{item.body}</TableCell>
                            <TableCell>{item.sentiment}</TableCell>
                            <TableCell>{item.sentiment_score['compound']}</TableCell>
                            <TableCell>{item.created}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default renderCSVTable;