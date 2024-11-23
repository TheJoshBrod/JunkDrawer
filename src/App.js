import './App.css';
import FileSearch from './Search';
import FileSystem from './System';

function App() {
  const queryParams = new URLSearchParams(window.location.search);


  return (
    <div className="App">
      <div className="Header">
        <img src="./logo.svg" alt="Logo" />
        <FileSearch />
      </div>
      <FileSystem file_directory_id={queryParams.get("file_id")}/>
    </div>
  );
}

export default App;
