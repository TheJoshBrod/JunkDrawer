import "./Navbar.css"
import React, { useState } from 'react';

const FileTree = () => {


    return (<></>)
};


const Navbar = () => {
    const [createSelected, setCreateSelected] = useState(-1);
    const [menuVisible, setMenuVisible] = useState(false);


    const return_home = () => {window.open(`http://localhost:3000`, '_self');}

    const create_item = () => {
        if (!createSelected || createSelected === -1) {
            setCreateSelected(true); 
            setTimeout(() => setMenuVisible(true), 50);
        } else {
            setMenuVisible(false);
            setCreateSelected(false)
        }
    }

    const is_selected = () => {
        // Set as -1 to not show closing animation (otherwise identicial to unselected)
        if(createSelected === -1){
           return "";
        }
        return (createSelected) ? "-selected" : "-unselected";
    }

    const creat_option_selected = (e, action) => {
        e.stopPropagation();
        console.log(action);
    }

    return (
    <div className="nav-bar">
        <div className={`create-button${is_selected()}`} onClick={() => create_item()}>
            <p>Create</p>
            <div className={`create-option-menu ${menuVisible ? "visible" : "hidden"}`}>
                <p className="create-options" onClick={(e) => creat_option_selected(e, "file")}>
                    Create File
                </p>
                <p className="create-options" onClick={(e) => creat_option_selected(e, "update")}>
                    Update File
                </p>
                <p className="create-options" onClick={(e) => creat_option_selected(e, "directory")}>
                    Create Directory
                </p>
            </div>
        </div>
        <div className="home-button" onClick={() => return_home()}>
            <p>Home</p>
        </div>
        <div className="file-nav">
            <FileTree/>
        </div>

    </div>
  );
};

export default Navbar;
