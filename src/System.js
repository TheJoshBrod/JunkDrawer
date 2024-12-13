import "./System.css"
import React, { useEffect, useState } from 'react';

// FileObject Component
const FileObject = ({ file_name, file_type, file_extension, file_created_at, file_size, index, parent_id, child_id }) => {

  const deleteFile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/delete_file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file_name,
          parentId: parent_id,
          childId: child_id,
        }),  
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Error || 'Failed to delete the file');
      }
  
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert(error.message);
    }
  };

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
      link.download = file_name;
      link.click();
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert(error.message);
    }
  };
  
  const extension_img = (file_extension) => {
    
    // Make sure extension is in lowercase
    const format_extension = file_extension.toLowerCase();

    // Is file extension an image?
    const image_extensions = ["png", "gif", "jpeg", "jpg", "bitmap", "webp", "svg", "tiff", "tif", "heif", "heic", "ico"];
    if (image_extensions.find((extension) => extension === format_extension) ){
      return "image.png";
    }

    return "unknown-file-type.png";
  };

  return (
    <>
      {file_type === 1 ? 
        /*File*/
        (
        <div id={index} className="file-object" >
          <div className="file-download" onClick={() => downloadFile()}>
          <img className="file-icon" alt="Representation of file type" src={`/file_icons/${extension_img(file_extension)}`}/>
            <p> {file_name}</p>
            <p> {file_size}</p>
            <p> {file_created_at} </p>
          </div>
          <div className="file-delete" onClick={() => deleteFile()}> <img className="file-icon" src="/file_icons/trash-can.png"/> </div>
        </div>
        )
        
        :
        
        file_type === 0 ?

        /*Directory*/
        (
        <div id={index} className="file-object" onClick={() => window.open(`http://localhost:3000/?file_id=${child_id}`, '_self')}>
          
          <div className="directory-open">
            <img className="file-icon" alt="Representation of directory" src="/file_icons/directory.png"/>
            <p> {file_name}</p>
            <p> {file_size}</p>
            <p> {file_created_at} </p>
          </div>
        </div>
      )
    
      :

      
      /*Temporary Empty FileObject*/
      (
        <div id={index} className="temp-file-object">
          <p> {""} </p>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parentId === null){
      setParentId("0");
    }

    const interval = setInterval(() => {
      fetch(`http://127.0.0.1:5000/get_children/${parentId}`)
        .then((response) => response.json())
        .then((data) => {
          setChildren(data);
        })
        .catch((error) => console.error("Error fetching children:", error))
        .finally(setLoading(false));
    }, 1000);
  
    return () => clearInterval(interval);
  }, [parentId]);


  const placeholderData = Array.from({ length: 10 }).map((_, index) => ({
    name: `Loading...`,
    is_file: -1, 
    extension: '',
    created_at: '',
    size: '',
    id: '',
  }));

  const handleDragOver = (event) => {
    event.preventDefault();
  };

    const uploadFile = (event) => {
      event.preventDefault();
      
      const file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];
    
      if (file) {
        const formData = new FormData();
        formData.append('content', file);
        formData.append('parentId', file_directory_id);
        formData.append('filename', file.name)

        fetch('http://127.0.0.1:5000/upload_default_file', {
          method: 'POST',
          body: formData,
        }).catch((error) => console.error("Error fetching children:", error))
      };
    }

  return (
    <div className="file-system" onDragOver={handleDragOver} onDrop={uploadFile}>
      <div className="file-objects">
      {loading ? (
        /* Temporary Loading Animation */
        placeholderData.map((child, index) => (
          <FileObject
            key={index}
            index={index}
            file_name={child.name}
            file_type={child.is_file}
            file_extension={child.extension}
            file_created_at={child.created_at}
            file_size={child.size}
            parent_id={parentId}
            child_id={child.id}
          />
        ))
      ) : (
        children.length === 0 ?

        /* Empty Directory */
        (<div><p>Empty Directory</p></div>)

        :

        (/* Create all files/directories */
        children.map((child, index) => (
          <FileObject
            index={index}
            file_name={child.name}
            file_type={child.is_file}
            file_extension={child.extension}
            file_created_at={child.created_at}
            file_size={child.size}
            parent_id={parentId}
            child_id={child.id}
          />
        )))
      )}
      </div>
    </div>
  );
};

export default Filesystem;
