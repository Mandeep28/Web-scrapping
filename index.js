const express = require("express");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const os = require("os");
require("dotenv").config({});

const app = express();
const port = process.env.PORT || 8001;
app.use(express.json());

// Serve static files from a directory (e.g., "public")
app.use(express.static(path.join(__dirname, "public")));

app.get("/dashboard", (req, res) =>{
  res.sendFile(path.join(__dirname, "public", "dashbaord.html"))
})

app.get("*", (req, res) =>{
  res.redirect("/")
})
  



// Define a route that returns JSON data
app.post("/data", async(req, res) => {
  const {url , negativeMark } = req.body;
  // console.log(`url and negativeMark is :`,req.body);
  // const url =
  //   "https://ssc.digialm.com///per/g27/pub/2207/touchstone/AssessmentQPHTMLMode1//2207O23185/2207O23185S24D99589/1690372353748563/1404005360_2207O23185S24D99589E1.html";

  try {
    const urlPattern = /^(http:\/\/|https:\/\/)/;
    if(!urlPattern.test(url)){
     return res.status(400).json({status: 400, message: "url is not valid"});
    }
    const response = await axios.get(url)
      if (response.status === 200) {
        const html = response.data;
        // load html 
        const $ = cheerio.load(html);
        const menuContainers = $(".rw");
        const dataObj = [];
        menuContainers.each((index, element) => {
          const item = $(element);
          const questionId = item.find(".menu-tbl tbody tr:nth-child(1)").text().split("\t")[0].split(":")[1];
          const optionChoose = item.find(".menu-tbl tbody tr:nth-child(3)").text().split("\t")[0].split(":")[1];
          const allOptions = item.find(".questionRowTbl tbody tr:nth-last-child(-n+4)");
          const rightAnsIndex = allOptions
            .map((index, ele) => {
              const trElement = $(ele);
              const tdElement = trElement.find("td.rightAns");
              if (tdElement.length > 0) {
                return index+1;
              }
            })
            .get();
          dataObj.push({ questionId , optionChoose : parseInt(optionChoose) , rightAns: rightAnsIndex[0]});
        });
        const resultObj = {
          attempt : 0,
          correctAttempt: 0
        };
        for(let i=0; i<dataObj.length; i++){
            if(dataObj[i].optionChoose){
              resultObj.attempt +=1;
            }
            if(dataObj[i].optionChoose === dataObj[i].rightAns){
              resultObj.correctAttempt+=1;
            }
        }
        resultObj.unAttempt = dataObj.length - resultObj.attempt 
        resultObj.inCorrectAttempt = resultObj.attempt - resultObj.correctAttempt 
        resultObj.accuracy = (resultObj.correctAttempt/resultObj.attempt)*100;
        resultObj.positiveMarks = resultObj.correctAttempt * 2;
        resultObj.negativeMarks = resultObj.inCorrectAttempt * negativeMark;
        resultObj.totalMarks = resultObj.positiveMarks - resultObj.negativeMarks;
        res.status(200).json({status: 200, message: 'success', data: resultObj})
      }
  } catch (error) {
    console.log(`error is :`, error);
    res.status(400).json({ status: 400, message: "failed to load resources" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`os hostname = `, os.hostname());
  console.log(`Server is running on  http://localhost:${port}`);
});
