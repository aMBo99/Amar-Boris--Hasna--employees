
function getDate(dateString) {
    if (dateString === 'NULL') return new Date();
    return new Date(dateString);
}

function getWorkingPairs(results, pairsArr) {
    let index = 0;
    results.data.forEach((el) => {
        results.data.forEach((element) => {
            const workedOnSameProject = pairsArr.find((obj) => {
                return ((obj.projectid == el.ProjectID) 
                && (((obj.empid1 == element.EmpID) && (obj.empid2 == el.EmpID)) 
                || ((obj.empid1 == el.EmpID) && (obj.empid2 == element.EmpID))));
            })
            if ((el.EmpID != element.EmpID) && (el.ProjectID == element.ProjectID) && (!workedOnSameProject)) {
                let dateTo = getDate(el.DateTo);
                let dateFrom = getDate(el.DateFrom);
                let dateTo2 = getDate(element.DateTo);
                let dateFrom2 = getDate(element.DateFrom);
                let timeCommon;
                if (dateFrom <= dateFrom2 && dateTo >= dateFrom2) {
                    if (dateTo <= dateTo2) {
                        timeCommon = dateFrom2.getTime() - dateTo.getTime();
                    } else {
                        timeCommon = dateFrom2.getTime() - dateTo2.getTime();
                    }
                } else if (dateFrom2 <= dateFrom && dateTo2 >= dateFrom) {
                    if (dateTo2 <= dateTo) {
                        timeCommon = dateFrom.getTime() - dateTo2.getTime();
                    } else {
                        timeCommon = dateFrom.getTime() - dateTo.getTime();
                    }
                } else {
                    return;
                }
                let commonTime = Math.abs(timeCommon);
                pairsArr[index] = {
                    empid1: el.EmpID,
                    empid2: element.EmpID,
                    projectid: el.ProjectID,
                    cTime: commonTime
                };
                index++;
            }
        })
    })
}

function displayData(filteredRest) {
    let finalResult = "";
    filteredRest.forEach(pair => {
        let resQ = `<td>${pair.empid1}</td>` 
        + `<td>${pair.empid2}</td>` 
        + `<td>${pair.projectid}</td>` 
        + `<td>${Math.floor(pair.cTime / 86400000)}</td>`;
        let finalRes = "<tr>" + resQ + "</tr>";
        finalResult += finalRes;
    })

    let result = `<table class="table">
      <thead class="thead-dark">
        <tr>
          @header
        <tr>
      </thead>
      <tbody>
        @body
      </tbody>
    </table>`;

    let headerT = `<th>Employee ID #1</th>` 
    + `<th>Employee ID #2</th>` 
    + `<th>Project ID</th>` 
    + `<th>Days worked</th>`

    result = result.replace("@header", headerT);
    result = result.replace("@body", finalResult);
    document.getElementById("result").innerHTML = result;
}

function generateTable(results) {
    let pairsArr = [];
    getWorkingPairs(results, pairsArr);
    let sortedPairs = pairsArr.sort((a, b) => (a.cTime < b.cTime) ? 1 : -1);
    let topPair = sortedPairs[0];
    let filteredRest = sortedPairs.filter((pair) => {
        return (((pair.empid1 === topPair.empid1) && (pair.empid2 === topPair.empid2)) 
        || ((pair.empid1 === topPair.empid2) && (pair.empid2 === topPair.empid1)));
    });
    displayData(filteredRest);
}

const inputElement = document.getElementById("myfile");
inputElement.addEventListener("change", handleFiles);
function handleFiles() {
    var file = document.getElementById("myfile").files[0];
    var reader = new FileReader();
    content = reader.readAsText(file);
    reader.onload = function () {
        Papa.parse(reader.result, {
            header: true,
            complete: function(results) {
                generateTable(results)
            }     
        })
    };
}