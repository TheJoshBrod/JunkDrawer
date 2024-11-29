import './App.css';
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
        <div className="Header-Bar">
          <div className="Header">
            <img src="./logo.svg" alt="Logo" />
            <FileSearch className="file-search" />
          </div>
        </div>
        <FileSystem file_directory_id={queryParams.get("file_id")}/>
      </div>
    </>
  );
}

export default App;
