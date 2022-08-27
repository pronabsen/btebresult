const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs");
const pdf = require("pdf-parse");
const mongoose = require("mongoose");

const Result = require("./model/model");
const Log = require("./model/log.model");
const Count = require("./model/count.model");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(fileUpload());

mongoose
  .connect(process.env.CLOUD_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.post("/file_ready", (req, res) => {
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

app.post("/upload", async (req, res) => {
  try {
    const { fileName, fileSize } = req.body.file;
    const { year, semester } = req.body;

    //file existence check before upload
    const existFile = await Log.findOne({
      $or: [{ fileName }, { size: fileSize }],
    });

    if (existFile)
      return res.status(400).send({ msg: "File already upload !" });

    //save upload logs
    const logSave = new Log({ fileName, size: fileSize });
    await logSave.save();

    //save results data
    let dataBuffer = fs.readFileSync("public/files/" + fileName);
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
        });
        await resultSave.save();
        if (count === strLen) {
          console.log("success");
          return res.status(200).json({ status: "success" });
        }
        count++;
      });
    });
  } catch (e) {
    res.status(500).send(e);
    console.log(e.message);
  }
});

//

//get total result
app.post("/total_result", (req, res) => {
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
app.post("/get_result/:year/:semester/:roll", async (req, res) => {
  const { year, roll, semester } = req.params;

  if (!year || !roll || !semester)
    return res.status(400).send("Filed is required !");

  const result = await Result.findOne({ roll, year, semester });

  if (!result) return res.status(400).json({ msg: "Not found !" });

  res.send(result);
});
// get all semester result
app.post("/get_result_all/:roll", async (req, res) => {
  const { roll } = req.params;

  const result = await Result.find({ roll });

  res.send(result);
});

//get total serach count
app.get("/get_total_search_count", async (req, res) => {
  const searchCount = await Count.findOne({ count: "searchCount" });
  res.send(searchCount);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
