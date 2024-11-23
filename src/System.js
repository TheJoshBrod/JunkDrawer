import style from "./System.css"
import React, { useEffect, useState } from 'react';

// FileObject Component
const FileObject = ({ file_name, file_type, file_extension, file_created_at, file_size, index, parent_id }) => {

  const [fileName, setFileName] = useState(file_name);
  const [parentId, setParentId] = useState(parent_id);

  const downloadFile = async (fileName, parentId) => {
  
    try {
      const response = await fetch('http://127.0.0.1:5000/get_file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_name: file_name,
          parent_id: parent_id,
        }),  
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Error || 'Failed to download the file');
      }
  
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file_name;  // Use the file name from the server
      link.click();  // Trigger the download
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert(error.message); // Show error to user
    }
  };
  
  return (
    <>
      {file_type === 1 ? 
        /*File*/
        (
        <div id={index} className="file-object" onClick={() => downloadFile()}>
          <img className="file-icon" src="/file_icons/unknown-file-type.png"/>
          <p> {file_name}</p>
          <p> {file_size}</p>
          <p> {file_created_at} </p>
        </div>
        )
        
        : 

        /*Directory*/
        (
        <div id={index} className="file-object">
          <img className="file-icon" src="/file_icons/directory.png"/>
          <p> {file_name}</p>
          <p> {file_size}</p>
          <p> {file_created_at} </p>
        </div>
      )
      }
    </>
    
  );
};

// Filesystem Component
const Filesystem = ({ file_directory_id }) => {
  const [parentId, setParentId] = useState(file_directory_id);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/get_children/${parentId}`)
      .then(response => response.json())
      .then(data => {
        setChildren(data);
      })
      .catch(error => console.error('Error fetching children:', error));
  }, [parentId]);

  return (
    <div className="file-system">
      <h3>Filesystem</h3>
      <p>Browse files and folders:</p>

      {children.length > 0 ? (
        /* Create all files/directories */
        children.map((child, index) => (
          <FileObject
            index={index}
            file_name={child.name}
            file_type={child.is_file}
            file_extension={child.extension}
            file_created_at={child.created_at}
            file_size={child.size}
            parent_id={parentId}
          />
        ))
      ) : (
        /* No files/directories found */
        <p>No files or folders found.</p>
      )}
    </div>
  );
};

export default Filesystem;
