import "./Search.css"
import React, { useEffect, useState } from 'react';

const FileSearchSpecifier = ({ names, values, setter, set_as, clearer, color, border_color }) => {
  
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
    <div className="file-specifier">
      {set_as === "" ? 
      (
        <> 
          <select className={"file-specifier-select" + is_selected()} value={set_as} onChange={(e) => setter()}>
            {options}
          </select>
        </>
      ) 
      : 
      (
        <>
          <select className={"file-specifier-select" + is_selected()} value={set_as} onChange={(e) => setter()} style={{ backgroundColor: color, borderColor: border_color }}>
            {options}
          </select>
          <button className="file-specifier-remove" onClick={clearer}>
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

    const [selectedFileType, setSelectedFileType] = useState("file-type");
    const [fileTypeSelected, setFileTypeSelected] = useState("");
    
    const [selectedFileDate, setSelectedFileDate] = useState("file-date");

    const fileType_values = ["","image","document","code","audio"];
    const fileType_names = ["File Type:","Image","Document","Code","Audio"];
    const [fileType, setFileType] = useState(fileType_values[0]); 
    const clearFileType = () => {setFileType("")};

    const fileDate_values = ["","day","week","month","year","past_year"];
    const fileDate_names = ["File Date:","Today","This Week","This Month","This Year " + new Date().getFullYear(), "Past Year " + ((new Date().getFullYear()) - 1)];
    const [fileDate, setFileDate] = useState(fileDate_values[0]); 
    const clearFileDate = () => {setFileDate("")};

    const handleFileSearchEnd = (event) => {
      setFileTypeSelected("")
      setSelectedFileType("file-type");
    }

    const handleFileSearchTypeChange = (event) => {
      setFileTypeSelected("-selected");
      setSelectedFileType(event.target.value);
    };
    const handleFileSearchDateChange = (event) => {
      setSelectedFileDate(event.target.value);
    };

    // Function to handle input change
    const handleInputChange = (event) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        if (newValue === ""){
          setResults([]);
          setIsHidden("-is_hidden");
          return
        }
        if (newValue.trim() === ''){
          setResults([]);
          setIsHidden("-is_hidden");
          return
        }
        setIsHidden("");
        fetch(`http://127.0.0.1:5000/search_file?` + new URLSearchParams({query: newValue}).toString())
        .then((response) => response.json())
        .then((data) => {
          if (!data) {
            data = [];
          }
          setResults(data.results);
        })
        .catch((error) => console.error("Error fetching children:", error))
    };

    const handleInputFocused = (event) => {
      if(isFocused === ""){
        setIsFocused("-selected");
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
        <div className="file-selector">
          <select className={"file-type"+fileTypeSelected} id="file-type" value={selectedFileType} onChange={handleFileSearchTypeChange}>
            <option selected hidden value="file-type">File Type:</option>
            <option value="Image">Image</option>
            <option value="Document">Document</option>
            <option value="Code">Code</option>
            <option value="Audio">Audio</option>
          </select>
          {selectedFileType !== "file-type" && (
            <button className="remove-button" onClick={handleFileSearchEnd}>
              <p>X</p>
            </button>
          )}
        </div>

        <div className="file-selector">
          <select className="file-type" id="file-date" value={selectedFileDate} onChange={handleFileSearchDateChange}>
            <option selected hidden value="file-date">Last modified:</option>
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year {new Date().getFullYear()}</option>
            <option value="past-year">Past Year {(new Date().getFullYear()) - 1}</option>
          </select>
          {selectedFileDate !== "file-date" && (
            <button className="remove-button" onClick={() => setSelectedFileDate("file-date")}>
              <p>X</p>
            </button>
          )}
        </div>
        <div>
          <FileSearchSpecifier
            names={fileType_names}
            values={fileType_values}
            setter={setFileType}
            set_as={fileType}
            clearer={clearFileType}
            color="#04a6f7"
            border_color="#04a6f7"
          />
        </div>
        <div>
          <FileSearchSpecifier
            names={fileDate_names}
            values={fileDate_values}
            setter={setFileDate}
            set_as={fileDate}
            clearer={clearFileDate}
            color="#04a6f7"
            border_color="#0406f7"
          />
        </div>
      </div>
      <div className={`searchResults${isFocused}`}>
        {results.map((item) => (
          <div key={item} className="result">
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSearch;
