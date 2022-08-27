import React from "react";

const ResultNotFound = ({ setResultNotFound }) => {
  return (
    <div>
      <h5 className="text-danger">Result not found</h5>
      <button
        className="btn btn-sm btn-primary mt-5"
        onClick={() => setResultNotFound(false)}
      >
        Back
      </button>
    </div>
  );
};

export default ResultNotFound;
