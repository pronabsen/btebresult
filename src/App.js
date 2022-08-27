import React, { useState } from "react";
import "./App.css";
import Count from "./Count";
import FileUpload from "./fileupload";
import ResultNotFound from "./ResultNotFound";
import ResultSearch from "./ResultSearch";
import ShowResult from "./ShowResult";

function App() {
  const [formSwitch, setFormSwitch] = useState(true);
  const [resultData, setResultData] = useState();
  const [resultNotFound, setResultNotFound] = useState(false);

  return (
    <div className="App">
      <Count />
      <div className="formSwitch d-flex flex-row justify-between mb-5">
        <button
          className={
            formSwitch
              ? "btn btn-primary w-100 mx-2"
              : "btn btn-outline-primary w-100 mx-2"
          }
          onClick={() => setFormSwitch(true)}
        >
          Upload
        </button>
        <button
          className={
            formSwitch
              ? "btn btn-outline-primary w-100 mx-2"
              : "btn btn-primary w-100 mx-2"
          }
          onClick={() => setFormSwitch(false)}
        >
          Search
        </button>
      </div>
      {formSwitch ? (
        <FileUpload />
      ) : resultData ? (
        <ShowResult resultData={resultData} setResultData={setResultData} />
      ) : resultNotFound ? (
        <ResultNotFound setResultNotFound={setResultNotFound} />
      ) : (
        <ResultSearch
          setResultData={setResultData}
          setResultNotFound={setResultNotFound}
        />
      )}
    </div>
  );
}
export default App;
