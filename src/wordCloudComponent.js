import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@visx/text';
import { scaleLog } from '@visx/scale';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';
// Assume sentencesList is imported or defined somewhere
// import { sentencesList } from './yourDataSource';

const CreateWordCloud = (posts, comments, width, height, showControls) => {
  const [spiralType, setSpiralType] = useState('rectangular');
  const [withRotation, setWithRotation] = useState(false);
  const [wordsKey, setWordsKey] = useState(0); // Key to force re-render
  const [combinedWords, setCombinedWords] = useState([]);
  const [dynamicWidth, setDynamicWidth] = useState(window.innerWidth * 0.5);
  const postsRef = useRef(posts);
  const commentsRef = useRef(comments);

  useEffect(() => {
    postsRef.current = posts;
    commentsRef.current = comments;
  }, [posts, comments]);

  const colors = ['#143059', '#2F6B9A', '#82a6c2'];
  // console.log("CWC posts",posts);
  // console.log("CWC comments",comments);

  function wordFreq(text) {
    const words = text.replace(/\./g, '').split(',');
    const freqMap = {};
  
    for (const w of words) {
      if (!freqMap[w] && w !== '') freqMap[w] = 0;
      freqMap[w] += 1;
    }
    return Object.keys(freqMap).map((word) => ({ text: word, value: freqMap[word] }));
  }
  
  function getRotationDegree() {
    const rand = Math.random();
    const degree = rand > 0.5 ? 60 : -60;
    return rand * degree;
  }
  
  const fontScale = scaleLog({
    domain: [Math.min(...combinedWords.map((w) => w.value)), Math.max(...combinedWords.map((w) => w.value))],
    range: [10, 100],
  });
  const fontSizeSetter = (datum) => fontScale(datum.value);
  
  const fixedValueGenerator = () => 0.5;

  const generateWordCloud = () => {
    // console.log("WordCloud Posts:",postsRef.current);
    const combinedBody = [...postsRef.current, ...commentsRef.current];
    let wordArrays = combinedBody.map(item => wordFreq(item.body_wordcloud));
    let allWords = wordArrays.flat();
    let wordFrequencyMap = {};
    allWords.forEach(word => {
      // Normalize the text for comparison (e.g., lowercase, trim spaces)
      let normalizedText = word.text.toLowerCase().trim();
      if (!wordFrequencyMap[normalizedText]) {
        wordFrequencyMap[normalizedText] = { ...word, value: 0, text: normalizedText };
      }
      wordFrequencyMap[normalizedText].value += word.value;
    });

    // Convert the frequency map back to an array
    let aggregatedWords = Object.values(wordFrequencyMap);
    // Sort words by frequency in descending order and then take the first 100
    aggregatedWords = aggregatedWords.sort((a, b) => b.value - a.value).slice(0, 100  );
    var filteredWords = aggregatedWords.filter(obj => !isNaN(obj.value));
    // console.log("WordCloud:", aggregatedWords);  
    setCombinedWords(filteredWords);
    setWordsKey(wordsKey + 1);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      generateWordCloud();
    }, 30000);
    // console.log("combined words:", combinedWords);
    // Clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [wordsKey]);
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
  return (
    <div className="wordcloud">
      <Wordcloud
        // key={wordsKey}
        words={combinedWords}
        width={dynamicWidth}
        height={height}
        fontSize={fontSizeSetter}
        font={'Impact'}
        padding={2}
        spiral={spiralType}
        rotate={withRotation ? getRotationDegree : 0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={`${w.text}+${wordsKey}`}
              fill={colors[i % colors.length]}
              textAnchor={'middle'}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
      {showControls && (
        <div>
          <label>
            Spiral type &nbsp;
            <select
              onChange={(e) => setSpiralType(e.target.value)}
              value={spiralType}
            >
              <option key={'archimedean'} value={'archimedean'}>
                archimedean
              </option>
              <option key={'rectangular'} value={'rectangular'}>
                rectangular
              </option>
            </select>
          </label>
          <label>
            With rotation &nbsp;
            <input
              type="checkbox"
              checked={withRotation}
              onChange={() => setWithRotation(!withRotation)}
            />
          </label>
          <br />
        </div>
      )}
    </div>
  );
}

export default CreateWordCloud;