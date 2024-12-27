import "./Navbar.css"
import React, { useState, useEffect } from 'react';

const FileTree = () => {
    return (
        <div className="file-nav">    
        </div>
    )
};

const CreateMenu = ({ selected, closeMenu, parent_id }) => {
    const [createMenuSelected, setCreateMenuSelected] = useState(false);

    const [newFileName, setNewFileName] = useState("");
    const [newFile, setNewFile] = useState("");
    
    const handleFileChange = (event) => {
        const file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];
        if (file) {
            setNewFile(file);
        }
    };
    
    const uploadFile = (event) => {
        event.preventDefault();
        
        // Prevents creating empty files
        if (newFile === "") {return;}
        if (newFile.length === 0) {return;}    
        
        // Prevents namelessfiles
        let fileName = newFileName
        if(newFileName === ""){fileName = newFile.name}

        // Creates a context for form
        const formData = new FormData();
        formData.append('content', newFile);
        formData.append('parentId', parent_id["file_directory_id"]);
        formData.append('filename', fileName)

        // Sends Post Request to Create File
        fetch('http://127.0.0.1:5000/upload_default_file', {
            method: 'POST',
            body: formData,
        }).catch((error) => console.error("Error fetching children:", error))
        
        closeCreateMenu();

    }


    const createDirectory = (event) => {
        event.preventDefault();

        // Creates a context for form
        const formData = new FormData();
        formData.append('parentId', parent_id["file_directory_id"]);
        formData.append('directoryName', newFileName)

        // Sends Post Request to Create File
        fetch('http://127.0.0.1:5000/upload_default_directory', {
            method: 'POST',
            body: formData,
        }).catch((error) => console.error("Error fetching children:", error))
        
        closeCreateMenu();
    }

    useEffect(() => {
        const create_option_selected = () => {
            setNewFile("");
            setNewFileName("");
            if (selected !== ""){
                setCreateMenuSelected(true);
            }
        };

        create_option_selected();
    }, [selected]); // The effect runs only when 'selected' changes

   const closeCreateMenu = () => {
        setCreateMenuSelected(false);
        closeMenu();
   }

   return (
        <>
            {createMenuSelected && 
            (
                <div className="create-menu">
                    <div className="selected-create-menu">

                        <div className="selected-create-menu-navbar">
                            <button className="selected-create-menu-x-button" onClick={closeCreateMenu}> X </button>
                        </div>

                        {/* Which Create Menu Option Selected: */}
                        {selected === "file" && (
                            <form className="selected-create-menu-form" onSubmit={uploadFile}>
                                <input type="file" name="content" onChange={handleFileChange}/>
                                <input type="search" name="filename" placeholder="New File Name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                                <input type="submit" value="Create File" />
                            </form>
                        
                        )}
                        {selected === "update" && (
                            <form className="selected-create-menu-form" onSubmit={(e) => { e.preventDefault(); console.log("Update directory form submitted");}}>
                                <input type="file" name="files[]" multiple />
                                <input type="submit" value="Update Directory" />
                            </form>
                        )}
                        {selected === "directory" && (
                            <form className="selected-create-menu-form" onSubmit={createDirectory}>
                                <input type="search" placeholder="Directory Name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                                <input type="submit" value="Create Directory" />
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};


const Navbar = (parent_id) => {
    const [createSelected, setCreateSelected] = useState(-1);
    const [menuVisible, setMenuVisible] = useState(false);
    const [createOptionSelected, setCreateOptionSelected] = useState("");

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

    const create_option_selected = (e, option) => {
        e.stopPropagation();
        setCreateOptionSelected(option);
    }

    const closeCreateMenu = () => {
        setCreateOptionSelected("");
    }

    return (
    <div className="nav-bar">
        <div className={`create-button${is_selected()}`} onClick={() => create_item()}>
            <p>Create</p>
            <div className={`create-option-menu ${menuVisible ? "visible" : "hidden"}`}>
                <p className="create-options" onClick={(e) => create_option_selected(e, "file")}>
                    Create File
                </p>
                <p className="create-options" onClick={(e) => create_option_selected(e, "update")}>
                    Update File
                </p>
                <p className="create-options" onClick={(e) => create_option_selected(e, "directory")}>
                    Create Directory
                </p>
            </div>
        </div>
        <div className="home-button" onClick={() => return_home()}>
            <p>Home</p>
        </div>
        <FileTree/>
       <CreateMenu selected={createOptionSelected} closeMenu={closeCreateMenu} parent_id={parent_id}/>
    </div>
  );
};

export default Navbar;
