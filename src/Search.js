import "./Search.css"
import React, { useEffect, useState } from 'react';

const FileSearchSpecifier = ({ names, values, setter, set_as, clearer, color, is_focused}) => {
  
  const options = values.map((value, index) => (
    <option key={value} value={value} hidden={index === 0}>
      {names[index]}
    </option>
  ));

  const is_selected = () => {
    if(set_as === ""){
      return "";
    }
    return "-selected"
  }


  return (
    <div className={"file-specifier"+is_focused}>
      {set_as === "" ? 
      (
        <> 
          <select className={"file-specifier-select" + is_focused} value={set_as} onChange={(e) => setter()}>
            {options}
          </select>
        </>
      ) 
      : 
      (
        <>
          <select className={"file-specifier-select" + is_selected()} value={set_as} onChange={(e) => setter()} style={{ backgroundColor: color}}>
            {options}
          </select>
          <button className={"file-specifier-remove" + is_focused} onClick={clearer}>
            <p>X</p>
          </button>
        </>
      )
      }
    </div>
  );
};


const FileSearch = () => {
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState([]);
    const [isHidden, setIsHidden] = useState("-is_hidden");
    const [isFocused, setIsFocused] = useState("");
    const [isResults, setIsResults] = useState("-no_results");

    const fileType_values = ["","directory","image","document","code","audio"];
    const fileType_names = ["Type:","Directory","Image","Document","Code","Audio"];
    const [fileType, setFileType] = useState(fileType_values[0]); 
    const clearFileType = () => {setFileType("")};

    const fileDate_values = ["","day","week","month","year","past_year"];
    const fileDate_names = ["Last Updated:","Today","This Week","This Month","This Year (" + new Date().getFullYear() + ")", "Past Year (" + ((new Date().getFullYear()) - 1) + ")"];
    const [fileDate, setFileDate] = useState(fileDate_values[0]); 
    const clearFileDate = () => {setFileDate("")};


    // Function to handle input change
    const handleInputChange = (event) => {
        const newValue = event.target.value;
        
        if (newValue.trim() === inputValue.trim()){
          setInputValue(newValue);
          return;  
        }
        setInputValue(newValue);
        
        if (newValue === ""){
          setResults([]);
          setIsHidden("-is_hidden");
          setIsResults("-no_results");
          return
        }
        if (newValue.trim() === ''){
          setResults([]);
          setIsHidden("-is_hidden");
          setIsResults("-no_results");
          return
        }
        setIsResults("");
        setIsHidden("");
        fetch(`http://127.0.0.1:5000/search_file?` + new URLSearchParams({query: newValue}).toString())
        .then((response) => response.json())
        .then((data) => {
          if (!data) {
            data = [];
          }
          setResults(data.results);

          if(data.results.length === 0){
            setIsResults("-no_results");
          }
        })
        .catch((error) => console.error("Error fetching children:", error))
    };

    const handleInputFocused = (event) => {
      if(isFocused === ""){
        setIsFocused("-focused");
      }
      else{
        setIsFocused("");
      }
    };
  
    return (
    <div className={"search-div" + isHidden + isFocused}>
      <div className={"search-bar"}>
        <img className="file-icon" alt="search logo" src="search-logo.png"/>
        <form>
          <input className="search-field" type="text" value={inputValue} onChange={handleInputChange} onFocus={handleInputFocused} onBlur={handleInputFocused} />
        </form>
      </div>
      
      
      <div className={`search-tools${isHidden}${isFocused}`}>
        <div>
          <FileSearchSpecifier
            names={fileType_names}
            values={fileType_values}
            setter={setFileType}
            set_as={fileType}
            clearer={clearFileType}
            is_focused={isFocused}
            color="#2a8aba"
          />
        </div>
        <div>
          <FileSearchSpecifier
            names={fileDate_names}
            values={fileDate_values}
            setter={setFileDate}
            set_as={fileDate}
            clearer={clearFileDate}
            is_focused={isFocused}
            color="#ba2a8a"
          />
        </div>
      </div>
      <div className={`searchResults${isFocused}${isResults}`}>
        {results.map((item) => (
          <div key={item} className={"result" + isFocused}>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSearch;
