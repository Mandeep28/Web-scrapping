console.log("welcome to site");
const loading = document.querySelector(".full");

const PATHNAME = window.location.pathname;



/**
 * Home page
 */
if(PATHNAME === '/'){
  localStorage.removeItem("resultData");
  const submitBtn = document.getElementById("submitBtn");
  const loading = document.querySelector(".full");
  submitBtn.addEventListener("click", async(e) =>{
    e.preventDefault();
    const url = document.getElementById("url").value;
    // console.log(`url is :`, url);
    const negative = document.getElementById("negative").value;
    // console.log(`negative is :`, negative);
    const category = document.getElementById("category").value;
    if(!url){
      alert("enter url first")
      return;
    }
    await fetchData(url, category, negative)
  })



  const fetchData = async (url, category, negative) => {
    loading.classList.add("show");
    try {
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url, negativeMark: negative })
        }
        const response = await fetch('https://ssc-result.onrender.com/data', options)
          const json = await response.json();
          if(json.status === 200){
            localStorage.setItem("resultData", JSON.stringify(json.data));
            window.location = "/dashboard";
          } else {
            alert(json.message)
          }
          
        } catch (error) {
          console.log(`error while fetching data`);
          
        }
        loading.classList.remove("show");


  }
}

/**
 * Dashboard Page
 */
else if (PATHNAME === '/dashboard'){
  const tableBody = document.getElementById("table-body");
// display resul data 
let data = localStorage.getItem("resultData");
data ? data = JSON.parse(data) : data = []

// result for right side 
const right = `
<div class="row">
          <div class="col key">Attempt</div>
          <div class="col value">${data.attempt}</div>
        </div>
        <div class="row">
          <div class="col key">unAttempt</div>
          <div class="col value">${data.unAttempt}</div>
        </div>
        <div class="row">
          <div class="col key">Correct Attempt</div>
          <div class="col value">${data.correctAttempt}</div>
        </div>
        <div class="row">
          <div class="col key">Incorrect Attempt</div>
          <div class="col value">${data.inCorrectAttempt}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col key">Accuracy</div>
          <div class="col value">${data.accuracy}%</div>
        </div>`;
    document.getElementById("right").innerHTML = right;

// result for left side 
const left = `<div class="row">
<div class="col key">Positive Marks</div>
<div class="col value">${data.positiveMarks}</div>
</div>
<div class="row">
<div class="col key">Negative Marks</div>
<div class="col value">${data.negativeMarks}</div>
</div>
<hr>
<div class="row">
<div class="col key">Total Marks</div>
<div class="col value">${data.totalMarks}</div>
</div>`;
document.getElementById("left").innerHTML = left;


}
