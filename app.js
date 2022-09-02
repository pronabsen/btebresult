const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs");
const pdf = require("pdf-parse");
require('dotenv').config();
const mongoose = require('mongoose');
//const database = require('./config')

const Result = require("./model/model");
const Log = require("./model/log.model");
const Count = require("./model/count.model");

const app = express();

app.use(express.json());
//app.use(cors({ origin: "http://localhost:4000", credentials: true }));
app.use(fileUpload());

const  mongoAtlasUri =
    "mongodb+srv://btebresult:8Oe8slfO1PoIyxWb@cluster0.b96gegr.mongodb.net/?retryWrites=true&w=majority";

const corsOptions ={
  origin:'http://localhost:3000',
  credentials:true,
  methods: "GET,PUT,POST,DELETE",
  //access-control-allow-credentials:true
  optionSuccessStatus:200,
}
app.use(cors(corsOptions))

try {
  // Connect to the MongoDB cluster
  mongoose.connect(
      mongoAtlasUri,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log(" Mongoose is connected")
  );

} catch (e) {
  console.log("could not connect");
}

app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  return res.send({ result: 'Success' });
});

/*
app.post("/ready_upload_file", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (!req.files) {
    return res.status(500).send({ msg: "file is not found" });
  }

  const myFile = req.files.file;

  myFile.mv(`${__dirname}/public/files/${myFile.name}`, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send({ msg: "Error occurred" });
    }

    return res.send({ name: myFile.name, path: `/${myFile.name}` });
  });
});
*/

app.post("/uploading_files", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const { fileName, fileSize, fileDirUrl} = req.body;
    const { year, semester, exam_type, regulation } = req.body;

    //file existence check before upload
    const existFile = await Log.findOne({
      $or: [{ fileName }, { size: fileSize }],
    });

    if (existFile)
      return res.status(400).send({ status: false, msg: "File already upload !" });

    //save upload logs
    const logSave = new Log({ fileName, size: fileSize, year, semester, regulation , exam_type});
    await logSave.save();

    //save results data
    let dataBuffer = fs.readFileSync(fileDirUrl + fileName);
    pdf(dataBuffer).then(function (data) {
      const strRep = data.text.replaceAll("}", "}} ");
      const str = strRep.split("} ");

      let strAry = [];

      str.map((item) => {
        const strIndex = item.indexOf("{");
        const strLastIndex = item.lastIndexOf("}");

        if (item.slice(strIndex - 7, strIndex).trim().length === 6) {
          if (item.includes(")")) {
            const strReplace = item.replaceAll(")", ") )");
            const str = strReplace.split(" )");

            str.map((i) => {
              const strPassLen = i.trim().split("").length;
              if (i.trim().split("")[strPassLen - 6] === "(") {
                const strPassIndex = i.indexOf("(");
                const strPassLastIndex = i.lastIndexOf(")");

                if (
                    i.slice(strPassIndex - 7, strPassIndex).trim().length === 6
                ) {
                  let roll = i.slice(strPassIndex - 7, strPassIndex - 1);
                  let gpa = i.slice(strPassIndex + 1, strPassLastIndex);
                  //strAry.push(i.slice(strPassIndex - 7, strPassLastIndex + 1));
                  strAry.push({
                    roll: roll,
                    status: "Passed",
                    grade: gpa,
                    referredSubject: "",
                    exam_type: exam_type,
                    regulation: regulation,
                  });
                }
              }
            });
          }

          let roll = item.slice(strIndex - 7, strIndex - 1);
          let failedSub = item
              .slice(strIndex + 1, strLastIndex)
              .replaceAll("\n", "");

          strAry.push({
            roll: roll,
            status: "Failed",
            grade: "",
            referredSubject: failedSub,
            exam_type: exam_type,
            regulation: regulation,
          });
        }
      });

      let strLen = strAry.length;
      let count = 1;
      strAry.map(async (i) => {
        const resultSave = new Result({
          roll: i.roll,
          year,
          semester,
          status: i.status,
          grade: i.grade,
          failedSubject: i.referredSubject,
          exam_type: exam_type,
          regulation: regulation,
        });
        await resultSave.save();
        if (count === strLen) {
          console.log("success");
          return res.status(200).json({ status: true, msg: "Result Uploaded Successfully!" });
        }
        count++;
      });
    });
  } catch (e) {
    res.status(500).json({ status: false, msg: e });
    console.log(e.message);
  }
});

//get total result
app.post("/get_total_results", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  let dataBuffer = fs.readFileSync("public/files/" + req.body.file.fileName);
  pdf(dataBuffer).then(function (data) {
    const strRep = data.text.replaceAll("}", "}} ");
    const str = strRep.split("} ");

    let strAry = [];

    str.map((item) => {
      const strIndex = item.indexOf("{");
      const strLastIndex = item.lastIndexOf("}");

      if (item.slice(strIndex - 7, strIndex).trim().length === 6) {
        if (item.includes(")")) {
          const strReplace = item.replaceAll(")", ") )");
          const str = strReplace.split(" )");

          str.map((i) => {
            const strPassLen = i.trim().split("").length;
            if (i.trim().split("")[strPassLen - 6] === "(") {
              const strPassIndex = i.indexOf("(");
              const strPassLastIndex = i.lastIndexOf(")");

              if (i.slice(strPassIndex - 7, strPassIndex).trim().length === 6) {
                let roll = i.slice(strPassIndex - 7, strPassIndex);
                let gpa = i.slice(strPassIndex + 1, strPassLastIndex);
                strAry.push({
                  roll: roll,
                  status: "Passed",
                  grade: gpa,
                  referredSubject: "",
                });
              }
            }
          });
        }
        let roll = item.slice(strIndex - 7, strIndex);
        let failedSub = item
            .slice(strIndex + 1, strLastIndex)
            .replaceAll("\n", "");

        strAry.push({
          roll: roll,
          status: "Fail",
          grade: "",
          referredSubject: failedSub,
        });
      }
    });

    res.send({ result: strAry.length });
  });
});

//get results
app.post("/get_student_result", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const { year, roll, semester, exam_type } = req.body;

  if (!year || !roll || !semester)
    return res.status(400).send( req.body);

  const result = await Result.findOne({ roll, year, semester, exam_type });
  if (!result) return res.status(400).json({ status: false, msg: "No Result Found! Please Try Again!" });

  res.send(result);
});

//get Uploaded Logs
app.get("/get_uploaded_logs", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const logs = await Log.find({});
  res.send(logs);
});

// get all semester result
app.post("/get_student_all_result", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { roll } = req.body;
  console.log({ roll })
  const result = await Result.find({ roll }).sort({ semester: 1 });

  res.send(result);
});


//get total serach count
app.get("/get_total_search_count", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const searchCount =  Count.findOne({ count: "searchCount" });
  res.send(searchCount);
});

/*

//get total result
app.get("/total_result", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  let dataBuffer = fs.readFileSync("public/files/6th_result_2016.pdf");
  pdf(dataBuffer).then(function (data) {
    const strRep = data.text.replaceAll("}", "}} ");
    const str = strRep.split("} ");

    let strAry = [];

    str.map((item) => {
      const strIndex = item.indexOf("{");
      const strLastIndex = item.lastIndexOf("}");

      if (item.slice(strIndex - 7, strIndex).trim().length === 6) {
        if (item.includes(")")) {
          const strReplace = item.replaceAll(")", ") )");
          const str = strReplace.split(" )");

          str.map((i) => {
            const strPassLen = i.trim().split("").length;
            if (i.trim().split("")[strPassLen - 6] === "(") {
              const strPassIndex = i.indexOf("(");
              const strPassLastIndex = i.lastIndexOf(")");

              if (i.slice(strPassIndex - 7, strPassIndex).trim().length === 6) {
                let roll = i.slice(strPassIndex - 7, strPassIndex);
                let gpa = i.slice(strPassIndex + 1, strPassLastIndex);
                strAry.push({
                  roll: roll,
                  status: "Passed",
                  grade: gpa,
                  referredSubject: "",
                });
              }
            }
          });
        }

        let roll = item.slice(strIndex - 7, strIndex);
        let failedSub = item
            .slice(strIndex + 1, strLastIndex)
            .replaceAll("\n", "");

        strAry.push({
          roll: roll,
          status: "Fail",
          grade: "",
          referredSubject: failedSub,
        });
      }
    });

    res.send({ result: strAry.length });
  });
});

*/

const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
