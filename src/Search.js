import React, { useState } from 'react';

const FileSearch = () => {
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState([]);


    // Function to handle input change
    const handleInputChange = (event) => {
        
        const newValue = event.target.value;
        setInputValue(newValue);

        setResults((prevResults) => {
         return []
        });

    };

  
    return (
    <div className="search-div">
    <form className="search-field">
        <input type="text" value={inputValue} onChange={handleInputChange}/>
    </form>
    <div className='searchResults'>
    {results.map((item) => (
        <div key={item} className="result">
          Div {item + 1}
        </div>
      ))}
    </div>
    </div>
  );
};

export default FileSearch;
