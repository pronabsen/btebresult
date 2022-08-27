import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ResultSearch = ({ setResultData, setResultNotFound }) => {
  const [filedCheck, setFiledCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = ({ year, semester, roll }) => {
    if (year === "Year" || semester === "Semester") {
      setFiledCheck(true);
    } else {
      setLoading(true);

      axios
        .post(
          `http://localhost:4000/get_result/${year}/${semester}/${roll}`,
          {}
        )
        .then((res) => {
          setResultData(res.data);
        })
        .catch((res) => {
          console.log(res.response.data);
          if (res.response) {
            setResultNotFound(res.response.data.msg);
          }
        });
    }
  };
  return (
    <div className="border p-4 rounded shadow">
      <h5 className="text-center">Search Result</h5>
      <hr />
      <form
        className="d-flex flex-column mt-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="number"
          className="form-control form-control-lg"
          name="roll"
          ref={register({
            required: "Roll is required !",
          })}
          autoFocus
        />
        {Object.keys(errors).length >= 1 && (
          <p className="text-danger">
            {errors.roll.message && errors.roll.message}
          </p>
        )}

        <div className="d-flex flex-row mt-3">
          <select
            className="form-select"
            name="year"
            ref={register({ required: "Year is required!" })}
          >
            <option>Year</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
          </select>

          <select
            className="form-select mx-2"
            name="semester"
            ref={register({ required: "Semester is required!" })}
          >
            <option>Semester</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
          </select>
        </div>

        {filedCheck && (
          <p className="text-danger ml-2">Select field required !</p>
        )}

        {loading ? (
          <button className="btn btn-primary btn-block mt-4" disabled>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        ) : (
          <button className="btn btn-primary btn-block mt-4">Search</button>
        )}
      </form>
    </div>
  );
};

export default ResultSearch;
