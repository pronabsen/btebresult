import React from "react";
import data from "./subject_code.json";

const ShowResult = ({ resultData, setResultData }) => {
  let subAry = [];

  const ary = resultData.failedSubject.trim().replaceAll(")", "").split(",");

  if (ary.length > 1) {
    ary.map((i) => {
      const value = i.slice(0, i.indexOf("(")).trim();
      data.map((item) => {
        if (value) {
          if (item.code.includes(value)) {
            subAry.push({ subject: item.subject, code: i + ")" });
          }
        }
      });
    });
  }

  //console.log(subAry);

  return (
    <div className="show-result border mt-5 p-4 rounded shadow">
      <div className="status text-center p-5 border rounded">
        {resultData.status === "Passed" ? (
          <h5 className="text-success">Passed</h5>
        ) : (
          <h5 className="text-danger">Failed</h5>
        )}

        {resultData.status === "Passed" && (
          <p className="text-muted">Grade : {resultData.grade}</p>
        )}
      </div>

      {resultData.status === "Failed" && (
        <div className="failed-subjects text-center mt-4 w-100">
          <div className="row bg-secondary text-white mb-3 p-1 rounded">
            <div className="col-7 px-0">Subject</div>
            <div className="col-5 px-0">Code</div>
          </div>

          {subAry.map((item, key) => {
            return (
              <div
                className="row border-bottom mx-2 py-2 d-flex flex-row align-items-center"
                key={key}
              >
                <div className="col-8 px-0">{item.subject}</div>
                <div className="col-4 px-0">{item.code}</div>
              </div>
            );
          })}
        </div>
      )}
      <button
        className="btn btn-primary btn-sm mt-4 w-100"
        onClick={() => setResultData(false)}
      >
        Back
      </button>
    </div>
  );
};

export default ShowResult;
