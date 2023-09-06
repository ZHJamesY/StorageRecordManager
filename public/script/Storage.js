let Clients = '';
$(document).ready(function()
{

  setupInactivityRefresh(10);

  // hide inactive tab content
  addTabBorder();

  // Get element
  let selectElement = document.getElementById("outboundClient");

  // Add an event listener to the select element to watch for changes
  selectElement.addEventListener("change", function () {
    // Get the selected value of the select element
    let selectedValue = selectElement.value;

    // Check if the selected value is not an empty string ('')
    if (selectedValue !== "") 
    {
      //update outbound all items list when client is selected
      getOutboundList(selectedValue);
    } 
    else 
    {
      console.log("No value is selected.");
      $("#myList").empty();
      $("#AllItemsListh2").html('All Items');
      
    }
  });


  // fetch all clients' name for outbound list
  fetch('/allClients')
  .then(response => response.json())
  .then(data => 
  {
    // set outbound client data dropdown list
    Clients = data;
    let options="";
    Clients.map((op,i)=>{
       options+=`<option value="${op}" id="${i}">${op}</option>`
    })
    document.getElementById("outboundClient").innerHTML=options;
  })
  .catch(error => 
  {
    console.error('Error fetching data:', error);
  });
  
  // submit data for inbound items
  $("#inboundForm").submit(function(event) 
  {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the form data
    let formData = $(this).serialize();

    // Get the value of the lang query parameter from the current URL
    let urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang');

    // Send the form data asynchronously using AJAX
    $.ajax({
        type: "POST",
        url: "/inbound",
        data: formData,
        success: function(response) 
        {

          // if response != "Not_New_Client", update outbound form client dropdown list
          if(response == "" || $("#clientName").val().toUpperCase() == response)
          {

            if(response == $("#clientName").val().toUpperCase())
            {
              Clients.push(response);
              let options="";
              Clients.map((op,i)=>{
                  options+=`<option value="${op}" id="${i}">${op}</option>`
              })
              document.getElementById("outboundClient").innerHTML=options;  
            }

            let selectElement = document.getElementById("outboundClient");

            // Get the selected value of the select element
            let selectedValue = selectElement.value;

            if(selectedValue == $("#clientName").val().toUpperCase())
            {
              getOutboundList($("#clientName").val().toUpperCase());
            }
            
            // clear only the index 2 input element
            $("#inboundForm")[0][2].value = '';

            let message = lang === 'CN' ? '完成' : 'Completed';
            showModal(message, lang);
          }
          else
          {
            showModal(response, lang);
          }
          
        },
        error: function(error) 
        {
          console.error("Form submission error:", error);
        }
    });
  });

  // submit data for outbound items
  $("#outboundForm").submit(function(event) 
  {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the value of the lang query parameter from the current URL
    let urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang');
    let result = findActiveListItem();
    if(result == false)
    {
      if(lang == "CN")
      {
        showModal("请选择一个物品", lang);
      }
      else if(lang == "ENG")
      {
        showModal("Please select an Item", lang);
      }
    }
    else
    {
      // Get the form data
      let formData = $(this).serialize();

      // item inbound date
      formData += '&itemDate=' + result.innerHTML.slice(result.innerHTML.indexOf(",") - 10, result.innerHTML.indexOf(","));

      // item tracking number
      formData += '&outboundTrackingNum=' + result.innerHTML.slice(result.innerHTML.indexOf("Tracking number: ") + 21, result.innerHTML.indexOf(',', result.innerHTML.indexOf(',') + 1));

      // item CBM
      formData += "&outboundCBM=" + result.innerHTML.slice(result.innerHTML.indexOf("CBM:") + 9);

      // Send the form data asynchronously using AJAX
      $.ajax(
      {
        type: "POST",
        url: "/outbound",
        data: formData,
        success: function(response) 
        {
          console.log("Form data submitted successfully!");

          if(typeof response != "string")
          {
            let div = document.getElementById("listContainer");
            let ul = document.getElementById("myList");
            ul.remove();

            let newUl = document.createElement("ul");
            newUl.id = "myList";

            for(let i = response.length - 1; i >= 0; i--)
            {
              let li = document.createElement("li");
              li.innerHTML = (response.length - i) + ". <b>Inbound Date: </b>" + response[i][0] + ", <b>Tracking number: </b>" + response[i][1] + ", <b>CBM: </b>" + response[i][2];
              newUl.appendChild(li);
            }
            div.appendChild(newUl);
  
            outboundListBoxAddActive();

            let message = lang === 'CN' ? '完成' : 'Completed';
            showModal(message, lang);
          }
          else
          {
            let message = lang === 'CN' ? '出库日期错误' : 'Outbound date error';
            showModal(message, lang);
          }
            
        },
        error: function(error) 
        {
          console.error("Form submission error:", error);
        }
      });
    }
  });

  preventBeyondDateClicked();

  // Get a reference to the button element using its id
  let button = document.getElementById('chargesBtn');

  // Add a click event listener to the button
  button.addEventListener('click', function() 
  {

    // get lang from url
    let urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang');
    let message = lang === 'CN' ? '输入日期' : 'Select date';
    showModalWithInput(message, lang);
  });

  let historyBtn = document.getElementById('historyBtn');

  // Add a click event listener to the button
  historyBtn.addEventListener('click', function() 
  {
    // get lang from url
    let urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang');
    let message = lang === 'CN' ? '输入日期' : 'Select date';
    showModalWithInputHistory(message, lang);
  });

  // Close the pop up box when the button is clicked
  $("#popUpCloseBtn").on("click", function() 
  {
    $("#popUpMsgBox").fadeOut();
  });

  // Close the pop up box when the cancel button is clicked
  $("#popUpCloseBtn2").on("click", function(event) 
  {
    event.preventDefault();
    $("#popUpMsgBox2").fadeOut();
  });

  $("#popUpCloseBtn3").on("click", function(event) 
  {
    event.preventDefault();
    $("#popUpMsgBox3").fadeOut();
  });

  $("#historyForm").submit(function(event) 
  {
    event.preventDefault();
    $("#popUpMsgBox3").fadeOut();

    // Get the value of the lang query parameter from the current URL
    let urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang');

    // Get the form data
    let formData = $(this).serialize();

    $.ajax(
    {
      type: "POST",
      url: "/history",
      data: formData,
      success: function(response) 
      {
        console.log("Form data submitted successfully!");
        
        if(typeof response != "string")
        {
          let div = document.getElementById("viewListContainer");
          div.innerHTML = "";

          // generate click button and dropdown table
          for(let i = 0; i < response.length; i++)
          {
            let clientBtn = document.createElement("button")
            clientBtn.setAttribute('type', 'button');
            clientBtn.classList.add('collapsible', "historyClientBtn");
            if(i == 0)
            {
              clientBtn.classList.add('historyTopBtn');
            }

            let clientChargesBtnInfo1 = document.createElement('h3');

            clientChargesBtnInfo1.textContent = response[i][0];

            clientBtn.appendChild(clientChargesBtnInfo1);

            clientBtn.addEventListener("click", toggleCollapsibleThree);

            div.appendChild(clientBtn);

            for(let j = 1; j < 3; j++)
            {
              let InOutBtn = document.createElement("button");
              InOutBtn.setAttribute('type', 'button');
              InOutBtn.classList.add('collapsible');
              InOutBtn.style.display = "none";

              let InOutBtnInfo = document.createElement('h5');

              if(j == 1)
              {
                InOutBtnInfo.textContent = "Inbound Items";
              }
              else 
              {
                InOutBtnInfo.textContent = "Outbound Items";
              }
              InOutBtn.appendChild(InOutBtnInfo);

              InOutBtn.addEventListener("click", toggleCollapsible);
  
              div.appendChild(InOutBtn);
              
              let table = document.createElement("table");
              table.id = "chargesTable";
              table.style.display = "none";

              div.appendChild(table);

              let thead = document.createElement("thead");
              table.appendChild(thead);

              let tr = document.createElement("tr");
              thead.appendChild(tr);

              let th1 = document.createElement("th");
              th1.innerHTML = "Inbound date";
              tr.appendChild(th1);

              let th6 = document.createElement("th");
              th6.innerHTML = "Outbound date";
              tr.appendChild(th6);

              let th2 = document.createElement("th");
              th2.innerHTML = "Tracking number";
              tr.appendChild(th2);

              let th3 = document.createElement("th");
              th3.innerHTML = "CBM";
              tr.appendChild(th3);

              let tbody = document.createElement("tbody");
              table.appendChild(tbody);
              tbody.id = "chargesTbody";

              response[i][j].forEach(row => 
              {
                if(row.length == 3)
                {
                  row.splice(1, 0, "N/A");
                }

                let newRow = document.createElement("tr");
                row.forEach(cellData => {
                    let cell = document.createElement("td");
                    cell.textContent = cellData;
                    newRow.appendChild(cell);
                });
                tbody.appendChild(newRow);
                
              });
            }
          }
        }            
        else
        {
          let message = lang === 'CN' ? '日期错误' : 'Date error';
          showModal(message, lang);
        }
      },
      error: function(error) 
      {
          console.error("Form submission error:", error);
      }
    });

  });

  // data export
  $("#exportBtn").on("click", function(event) 
  {
    let urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang');

    let div = document.getElementById("viewListContainer");

    event.preventDefault();
    if(div.innerHTML == "")
    {
      let message = lang === 'CN' ? '无数据' : 'No data';
      showModal(message, lang);
    }
    else
    {
      let childElements = div.children;
      let resultStr = "";

      // Loop through the child elements and do something
      for (let i = 0; i < childElements.length; i++) 
      {

        if(childElements[i].innerHTML.indexOf("thead") != -1)
        {
          resultStr += convertTableToCSV(childElements[i]) + "\n";
        }
        else
        {
          resultStr += '"' + removeTags(childElements[i]) + '"\n';
        }
      }
      downloadCSV(resultStr, "data.csv");
    }
  });

  // when storage charges confirm button is clicked
  $("#storageChargesForm").submit(function(event) 
  {
    event.preventDefault();
    $("#popUpMsgBox2").fadeOut();

    // Get the form data
    let formData = $(this).serialize();

    $.ajax(
    {
      type: "POST",
      url: "/charges",
      data: formData,
      success: function(response) 
      {
        console.log("Form data submitted successfully!");
        
        // generate storage charges table with response data
        let div = document.getElementById("viewListContainer");
        div.innerHTML = "";

        let totalChargesBtn = document.createElement("button");
        totalChargesBtn.setAttribute('type', 'button');
        totalChargesBtn.classList.add('chargesTopBtn');

        let totalChargesBtnInfo1 = document.createElement('h4');

        let firstDay = getFirstDayOfMonth(response[0][0])
        totalChargesBtnInfo1.textContent = firstDay + " to " + response[0][0] + ": $" + response[0][1];

        totalChargesBtn.appendChild(totalChargesBtnInfo1);

        div.appendChild(totalChargesBtn);

        for(let i = 1; i < response.length; i++)
        {
          let clientBtn = document.createElement("button")
          clientBtn.setAttribute('type', 'button');
          clientBtn.classList.add('collapsible');

          let clientChargesBtnInfo1 = document.createElement('h5');

          clientChargesBtnInfo1.textContent = response[i][0] + ": $" + response[i][1];

          clientBtn.appendChild(clientChargesBtnInfo1);

          clientBtn.addEventListener("click", toggleCollapsible);

          div.appendChild(clientBtn);

          let table = document.createElement("table");
          table.id = "chargesTable";
          table.style.display = "none";

          div.appendChild(table);

          let thead = document.createElement("thead");
          table.appendChild(thead);

          let tr = document.createElement("tr");
          thead.appendChild(tr);

          let th1 = document.createElement("th");
          th1.innerHTML = "Inbound date";
          tr.appendChild(th1);

          let th6 = document.createElement("th");
          th6.innerHTML = "Outbound date";
          tr.appendChild(th6);

          let th2 = document.createElement("th");
          th2.innerHTML = "Tracking number";
          tr.appendChild(th2);

          let th3 = document.createElement("th");
          th3.innerHTML = "CBM";
          tr.appendChild(th3);

          let th4 = document.createElement("th");
          th4.innerHTML = "Days";
          tr.appendChild(th4);

          let th5 = document.createElement("th");
          th5.innerHTML = "Charges";
          tr.appendChild(th5)

          let tbody = document.createElement("tbody");
          table.appendChild(tbody);
          tbody.id = "chargesTbody";

          response[i][2].forEach(row => 
          {
            if(row.length == 5)
            {
              row.splice(1, 0, "N/A");
            }

            let newRow = document.createElement("tr");
            row.forEach(cellData => {
                let cell = document.createElement("td");
                cell.textContent = cellData;
                newRow.appendChild(cell);
            });
            tbody.appendChild(newRow);
            
          });
        }
      },
      error: function(error) 
      {
        console.error("Form submission error:", error);
      }
    });
  });
});

// expand or collapse the next sibling element
function toggleCollapsible() 
{
  let content = this.nextElementSibling;
  if (content.style.display === "") 
  {
    content.style.display = "none";
  } 
  else 
  {
    content.style.display = "";
  }
}

// expand the first and third sibling elements or collapse next four sibling elements
function toggleCollapsibleThree() {
  let content = this.nextElementSibling;
  let thirdContent = content.nextElementSibling.nextElementSibling;

  for(let i = 0; i < 4; i++)
  {
    if(i == 0 || i == 2)
    {
      if (content.style.display === "") 
      {
        content.style.display = "none";
      } 
      else 
      {
        content.style.display = "";
      }
    }

    if(i == 1 || i == 3)
    {
      if (content.style.display === "") 
      {
        content.style.display = "none";
      } 
    }
    content = content.nextElementSibling;
  }
}

// hide tab contents
function hideInactiveTabContent()
{
  // Get all div elements with class "tab-pane"
  let divElements = document.querySelectorAll("div.tab-pane");
  // Loop through each div element and hide it if it doesn't have the class "show"
  divElements.forEach(divElement => {
      if (!divElement.classList.contains("show")) 
      {
        divElement.style.display = "none";
      }
  });
}

// border modifications, and hide inactive tab content
function addTabBorder()
{
  let navLinks = document.getElementsByClassName('nav-link');

  // Add click event listener to each 'nav-link' element
  Array.from(navLinks).forEach(function(link) 
  {
    link.addEventListener('click', function() 
    {

      // Remove border top from all other elements
      Array.from(navLinks).forEach(function(otherLink) 
      {
        if(otherLink !== link) 
        {
          // hide otherLink tab content
          let divElement = document.getElementById(otherLink.getAttribute("href").substring(1));
          divElement.style.display = 'none';
        }
      });
      
      // remove style none from current tab that was clicked
      divElement = document.getElementById(this.getAttribute("href").substring(1));
      divElement.style.display = '';
    });
  });
}

// click language button toggle between two languages
function toggleLanguage()
{
    // get elements
    let langBtn = document.getElementById('langToggleBtn');

     // Get the current URL parameters
    let urlParams = new URLSearchParams(window.location.search);

    if(langBtn.innerHTML == 'English')
    {
      langBtn.innerHTML = '中文';
      urlParams.set('lang', 'ENG');
      $("#recordTab").html("Record");
      $("#viewTab").html("View");
      $("#chargesBtn").html("Storage charges");
      $("#historyBtn").html("History");
      $("#yearMonthInputStartLabel").html("Start Date: ");
      $("#yearMonthInputEndLabel").html("End Date: ");
      $("#exportBtn").html("Export data");
    }
    else
    {
      langBtn.innerHTML = 'English';
      urlParams.set('lang', 'CN');
      $("#recordTab").html("登记");
      $("#viewTab").html("查看");
      $("#chargesBtn").html("仓租");
      $("#historyBtn").html("历史记录");
      $("#yearMonthInputStartLabel").html("开始日期: ");
      $("#yearMonthInputEndLabel").html("结束日期: ");
      $("#exportBtn").html("导出数据");
    }
    
    // Get the updated query string
    let updatedQueryString = urlParams.toString();

    // Get the current URL without the query string
    let baseUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;

    // Update the URL with the new query string without refreshing the page
    let newUrl = baseUrl + '?' + updatedQueryString;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

// pop up box fade in
function showModalWithInput(message, lang)
{
    // Set the modal message text
    $("#popUpBoxMsg2").text(message);

    if(lang == "CN")
    {
      $("#popUpCloseBtn2").html("取消");
      $("#popUpConfirmBtn").html("确认");
    }
    else if(lang == "ENG")
    {
      $("#popUpCloseBtn2").html('Cancel');
      $("#popUpConfirmBtn").html("Confirm");
  
    }
  
    // Show the modal overlay
    $("#popUpMsgBox2").fadeIn();
}

// pop up box fade in
function showModalWithInputHistory(message, lang)
{
  // Set the modal message text
  $("#popUpBoxMsg3").text(message);

  if(lang == "CN")
  {
    $("#popUpCloseBtn3").html("取消");
    $("#popUpConfirmBtn2").html("确认");
    $("#yearMonthInputStartLabel").html("开始日期: ");
    $("#yearMonthInputEndLabel").html("结束日期: ");
  }
  else if(lang == "ENG")
  {
    $("#popUpCloseBtn3").html('Cancel');
    $("#popUpConfirmBtn2").html("Confirm");
    $("#yearMonthInputStartLabel").html("Start Date: ");
    $("#yearMonthInputEndLabel").html("End Date: ");

  }

  // Show the modal overlay
  $("#popUpMsgBox3").fadeIn();
}


// pop up message box
function showModal(message, lang) 
{
  // Set the modal message text
  $("#popUpBoxMsg").text(message);

  if(lang == "CN")
  {
    $("#popUpCloseBtn").html("关闭");
  }
  else if(lang == "ENG")
  {
    $("#popUpCloseBtn").text = 'Close';

  }

  // Show the modal overlay
  $("#popUpMsgBox").fadeIn();
}

// add class active to li
function outboundListBoxAddActive()
{
  let listItems = document.querySelectorAll("ul#myList li");
  // Add a click event listener to each <li> element
  listItems.forEach(li => 
  {
    li.addEventListener('click', () => 
    {
      outboundListBoxRemoveActive();
      // add class active when element is clicked
      li.classList.add("active");
    });
  });
}

// remove class active from li
function outboundListBoxRemoveActive() 
{
  // Remove the 'active' class from all list items
  let listItems = document.querySelectorAll("ul#myList li");
  listItems.forEach(function (li) {
    li.classList.remove("active");
  });
}

// check if any li has class active, return such element else return false
function findActiveListItem() {
  let myList = document.getElementById("myList");
  let listItems = myList.getElementsByTagName("li");

  for (let i = 0; i < listItems.length; i++) 
  {
    if (listItems[i].classList.contains("active")) 
    {
      return listItems[i];
    }
  }
  return false;
}

function preventBeyondDateClicked()
{
  // prevent user select date beyond today
  let inboundDateElement = document.getElementById('date');
  let outboundDateElement = document.getElementById('outboundDate');


  // Get today's date
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  // Add leading zeros to single-digit months and days
  if (month < 10) 
  {
    month = '0' + month;
  }
  if (day < 10) 
  {
    day = '0' + day;
  }

  // set max date
  let maxDate = `${year}-${month}-${day}`;

  // Set the max attribute to today's date for the input element
  inboundDateElement.setAttribute('max', maxDate);
  outboundDateElement.setAttribute('max', maxDate);
}

// argument format: yyyy-mm-dd
function getFirstDayOfMonth(dateString) 
{
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const firstDayOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
  return firstDayOfMonth;
}

// function remove tags of an element
function removeTags(element) 
{
  return element.innerHTML.replace(/<[^>]+>/g, '');
}

// table element to csv
function convertTableToCSV(tableElement) 
{
  const rows = tableElement.querySelectorAll('tr');
  const csvRows = [];

  // Process each row and extract cell data
  rows.forEach(row => 
  {
    let csvColumns = [];
    let count = 0;
    row.querySelectorAll('td, th').forEach(cell => 
    {
      if(count == 2 && cell.textContent != "Tracking number")
      {
        csvColumns.push('"' + cell.textContent.trim().replace(/"/g, '""') + ' (T.Num)"');

      }
      else
      {
        csvColumns.push('"' + cell.textContent.trim().replace(/"/g, '""') + '"');

      }

      count += 1;
      
    });

    csvRows.push(csvColumns.join(','));
  });

  return csvRows.join('\n');
}

// download csv
function downloadCSV(csvData, filename) 
{
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;

  // Simulate a click on the link to trigger the download
  downloadLink.click();
}

function setupInactivityRefresh(timeoutInMinutes) 
{
  const inactivityTimeout = timeoutInMinutes * 60 * 1000;

  let timeoutId;

  function resetTimeout() 
  {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(refreshPage, inactivityTimeout);
  }

  function refreshPage() {
    // Reload the page
    location.reload();
  }

  window.addEventListener('mousemove', resetTimeout);
  window.addEventListener('keydown', resetTimeout);
  window.addEventListener('click', resetTimeout);

  resetTimeout();
}

function getOutboundList(selectedValue)
{
  $.ajax({
    type: "POST",
    url: "/allItems",
    data: selectedValue,
    success: function(response) 
    {
      console.log("Form data submitted successfully!");

      let div = document.getElementById("listContainer");

      let ul = document.getElementById("myList");
      ul.remove();

      let newUl = document.createElement("ul");
      newUl.id = "myList";

      for(let i = response.length - 1; i >= 0; i--)
      {
        let li = document.createElement("li");
        li.innerHTML = (response.length - i) + ". <b>Inbound Date: </b>" + response[i][0] + ", <b>Tracking number: </b>" + response[i][1] + ", <b>CBM: </b>" + response[i][2];
        newUl.appendChild(li);
      }
      div.appendChild(newUl);

      outboundListBoxAddActive();

      // modify #AllItemsListh2's text
      let newAllItemsListh2 = "All Items" + " - " + selectedValue;

      $("#AllItemsListh2").html(newAllItemsListh2);

    },
    error: function(error) 
    {
      console.error("Form submission error:", error);
    }
  });
}