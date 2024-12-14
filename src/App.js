import './App.css';
import Navbar from './Navbar';
import FileSearch from './Search';
import FileSystem from './System';

function App() {
  const queryParams = new URLSearchParams(window.location.search);


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
          <Navbar/>
          <FileSystem file_directory_id={queryParams.get("file_id")}/>
        </div>
      </div>
    </>
  );
}

export default App;
