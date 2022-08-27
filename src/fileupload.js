import axios from "axios";
import React, { useState } from "react";

function FileUpload() {
  const [totalResult, setTotalResult] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [estimatedMinute, setEstimatedMinute] = useState();
  const [uploadComplete, setUploadComplete] = useState(false);
  const [alreadyUpload, setAlreadyUpload] = useState(false);
  const [invalidFileType, setInvalidFileType] = useState(false);
  const [selectFiled, setSelectFiled] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files[0];

    console.log(file);

    const formData = new FormData();
    formData.append("file", file);

    if (file) {
      if (!file.name.includes(".pdf")) {
        setInvalidFileType(true);
        setTimeout(() => {
          setInvalidFileType(false);
        }, 5000);
      } else {
        localStorage.setItem(
          "file",
          JSON.stringify({ fileName: file.name, fileSize: file.size })
        );

        axios
          .post("http://localhost:4000/file_ready", formData)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => console.log(err));
      }
    }
  };

  const uploadFile = (e) => {
    e.preventDefault();

    let year = e.target.previousSibling.previousSibling.value;
    let semester = e.target.previousSibling.value;

    if (year === "Select Year" || semester === "Select Semester") {
      setSelectFiled(true);
    } else {
      let progress;

      axios
        .post("http://localhost:4000/upload", {
          file: JSON.parse(localStorage.getItem("file")),
          year,
          semester,
        })
        .then((res) => {
          if (res.data) {
            setProgressValue(100);
            progressStop();

            setTimeout(() => {
              setUploadComplete(true);
              setShowProgress(false);
            }, 1000);
          }
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status === 400) {
              progressStop();
              setAlreadyUpload(true);
              setShowProgress(false);
            }
          }
        });

      axios
        .post("http://localhost:4000/total_result", {
          file: JSON.parse(localStorage.getItem("file")),
        })
        .then((res) => {
          setShowProgress(true);
          updateProgress(res.data.result);
          setTotalResult(res.data.result);
          localStorage.removeItem("file");
        });

      //update progress bar
      const updateProgress = (data) => {
        const uploadTime = Math.ceil(data / 33.333) + 10;
        const progressPercentage = 100 / uploadTime;

        let count = 1;

        progress = setInterval(() => {
          if (count <= uploadTime) {
            let value = progressPercentage * count;

            setProgressValue(value);
            setEstimatedMinute(uploadTime - count);
            count++;
          } else {
            progressStop();
          }
        }, 1000);
      };

      function progressStop() {
        clearInterval(progress);
      }
    }
  };

  return (
    <div style={{ width: "400px" }} className="text-center">
      {showProgress ? (
        <>
          <div className="d-flex justify-content-between px-2">
            <span className="text-muted ">{Math.ceil(progressValue)}%</span>
            <p className="text-muted mb-0">
              <small>
                Time Remaining :{" "}
                {estimatedMinute > 60
                  ? Math.ceil(estimatedMinute / 60) + " min"
                  : Math.ceil(estimatedMinute) + " sec"}
              </small>
            </p>
          </div>

          <div className="progress mt-1">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              aria-valuenow="75"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: progressValue + "%" }}
            ></div>
          </div>
        </>
      ) : (
        <form>
          {!localStorage.getItem("file") ? (
            <>
              {invalidFileType && (
                <p className="border border-danger text-danger text-left p-2">
                  Invalid file type !
                </p>
              )}

              <input type="file" onChange={handleChange} accept={".pdf"} />
            </>
          ) : (
            <>
              {selectFiled && (
                <p className="text-center text-danger border border-danger p-2 rounded">
                  Filed must not be empty !
                </p>
              )}
              <b className="mx-3 d-block mb-3">
                File : {JSON.parse(localStorage.getItem("file")).fileName}
              </b>
              <select className="form-select">
                <option>Select Year</option>
                <option value="2010">2010</option>
                <option value="2011">2011</option>
                <option value="2012">2012</option>
                <option value="2013">2013</option>
                <option value="2014">2014</option>
                <option value="2015">2015</option>
                <option value="2016">2016</option>
                <option value="2017">2017</option>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>

              <select className="form-select mt-4">
                <option>Select Semester</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>

              <button
                onClick={uploadFile}
                className="btn btn-primary mt-5 w-100"
              >
                Upload
              </button>
            </>
          )}
        </form>
      )}

      <div className="upload-complete">
        <div
          id="exampleModalCenter"
          className={uploadComplete ? "modal fade show" : "modal fade hide"}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalCenterTitle"
          style={{ display: uploadComplete ? "block" : "none" }}
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content py-4 border-success">
              <div className="modal-body">
                <h1>
                  <i className="fas fa-check-circle text-success"></i>
                </h1>

                <h5 className="mb-2">Upload Successful</h5>

                <p>{totalResult} results were uploaded.</p>
                <button
                  className="btn btn-success mt-4 px-4"
                  onClick={() => setUploadComplete(false)}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="duplicate-upload">
        <div
          id="exampleModalCenter"
          className={alreadyUpload ? "modal fade show" : "modal fade hide"}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalCenterTitle"
          style={{ display: alreadyUpload ? "block" : "none" }}
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content py-4 border-warning">
              <div className="modal-body">
                <h1>
                  <i className="far fa-copy text-warning"></i>
                </h1>

                <h4 className="mt-3">Upload failed !</h4>

                <p>Duplicate file detected.</p>
                <button
                  className="btn btn-outline-warning mt-4 px-4"
                  onClick={() => setAlreadyUpload(false)}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FileUpload;

// axios
//       .post("http://localhost:4000/upload", formData, {
//         onUploadProgress: (ProgressEvent) => {
//           let progress =
//             Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100) +
//             "%";
//           setProgess(progress);
//         },
//       })
//       .then((res) => {
//         console.log(res);
//         getFile({
//           name: res.data.name,
//           path: "http://localhost:4000" + res.data.path,
//         });
//       })
//       .catch((err) => console.log(err));
//   };
