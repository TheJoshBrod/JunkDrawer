import './App.css';
import Navbar from './Navbar';
import FileSearch from './Search';
import FileSystem from './System';

function App() {
  
  
  const getParentId = () => {
    const queryParams = new URLSearchParams(window.location.search);
    let parent_id = queryParams.get("file_id");
    if (parent_id === "null"){
        return "0";
    }
    console.log(parent_id);
    return parent_id;
  }

  return (
    <>
      <header>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Google+Sans:400,500,700|Google+Sans+Text:400,500,700|Google+Sans+Display:400,500,700|Roboto:400,500,700&amp;display=swap" nonce="CSoNFMnAbjfM1cU-RuJjcg" />
      </header>
      <div className="App">
        <div className="file-system-header">
          <FileSearch className="file-search" />
          <h3>Filesystem</h3>
        </div>

        <p>Browse files and folders:</p>

        <div>
        </div>
        <div className="file-system-body">
          <Navbar     file_directory_id={getParentId()}/>
          <FileSystem file_directory_id={getParentId()}/>
        </div>
      </div>
    </>
  );
}

export default App;
