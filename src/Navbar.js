import "./Navbar.css"
import React, { useState } from 'react';


const Navbar = () => {
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
    <div className="nav-bar">
        <button>
            <p>Create!</p>
        </button>
        <div className="file-nav">
            <h3>asf</h3>
            <h3>asf</h3>
            <h3>asf</h3>
            <h3>asf</h3>
        </div>

    </div>
  );
};

export default Navbar;
