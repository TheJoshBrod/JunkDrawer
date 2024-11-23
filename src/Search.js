import React, { useState } from 'react';

const FileSearch = () => {
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState([]);

    // Function to handle input change
    const handleInputChange = (event) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        setResults((prevResults) => {
            // Append the new value and trim to the last 5 elements
            const updatedResults = [...prevResults, newValue].slice(-5);
            return updatedResults;
        });


        // Perform an action when the input changes
        console.log('Input changed:', results);
    };

  
    return (
    <>
    <form>
        <input type="text" value={inputValue} onChange={handleInputChange}/>
    </form>
    <div className='searchResults'>
    {results.map((item) => (
        <div key={item} className="box">
          Div {item + 1}
        </div>
      ))}
    </div>
    </>
  );
};

export default FileSearch;
