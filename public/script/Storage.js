let Clients
$(document).ready(function()
{
  addTabBorder();


  // Get element
  let selectElement = document.getElementById("outboundClient");

  // Add an event listener to the select element to watch for changes
  selectElement.addEventListener("change", function () {
    // Get the selected value of the select element
    let selectedValue = selectElement.value;

    // Check if the selected value is not an empty string ('')
    if (selectedValue !== "") {
      console.log("A value other than '' is selected: " + selectedValue);

      $.ajax({
        type: "POST",
        url: "/allItems",
        data: selectedValue,
        success: function(response) 
        {
          // Handle the response if needed (e.g., show a success message)
          console.log("Form data submitted successfully!");
          console.log(response);

          let div = document.getElementById("listContainer");

          let ul = document.getElementById("myList");
          ul.remove();

          let newUl = document.createElement("ul");
          newUl.id = "myList";


          console.log(response.length)

          for(let i = 0; i < response.length; i++)
          {
            let li = document.createElement("li");
            li.innerHTML = " " + (i + 1) + ". <b>Inbound date:</b> " + response[i][0] + ", <b>Tracking number:</b> " + response[i][1] + ", <b>CBM:</b> " + response[i][2];
            newUl.appendChild(li);
          }
          div.appendChild(newUl);

          outboundListBoxAddActive();
          

        },
        error: function(error) 
        {
          // Handle errors if any
          console.error("Form submission error:", error);
        }
      });
    } else {
      console.log("No value is selected.");
      // Do something when no value or '' is selected
    }
  });


  // fetch all clients' name
  fetch('/allClients')
  .then(response => response.json())
  .then(data => 
  {
    // set outbound client dropdown list
    Clients = data;
    let options="";
    Clients.map((op,i)=>{
       options+=`<option value="${op}" id="${i}" style="border-radius: 5px;"">${op}</option>`
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

    // Append the lang parameter to the formData
    // formData += '&lang=' + lang;

    // Send the form data asynchronously using AJAX
    $.ajax({
        type: "POST",
        url: "/inbound",
        data: formData,
        success: function(response) 
        {
            // Handle the response if needed (e.g., show a success message)
            console.log("Form data submitted successfully!");

            // if response != ..., update outbound form client dropdown list
            if(response != "Not_New_Client")
            {
              Clients.push(response);
              let options="";
              Clients.map((op,i)=>{
                 options+=`<option value="${op}" id="${i}" style="border-radius: 5px;"">${op}</option>`
              })
              document.getElementById("outboundClient").innerHTML=options;            
            }

            // clear form after data submitted successfully
            $("#inboundForm")[0].reset();

            let message = lang === 'CN' ? '完成' : 'Completed';
            showModal(message, lang);
        },
        error: function(error) 
        {
            // Handle errors if any
            console.error("Form submission error:", error);
        }
    });
  });

  // submit data for outbound items
  $("#outboundForm").submit(function(event) 
  {

    // Prevent the default form submission behavior
    event.preventDefault();

    if(findActiveListItem == false)
    {
      showModal()
    }

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
    }else{
      // Get the form data
      let formData = $(this).serialize();

      // Append the lang parameter to the formData
      formData += '&lang=' + lang;

      // item inbound date
      formData += '&itemDate=' + result.innerHTML.slice(8, 18);

      // item tracking number
      formData += '&outboundTrackingNum=' + result.innerHTML.slice(37, result.innerHTML.indexOf(',', result.innerHTML.indexOf(',') + 1));

      // item CBM
      formData += "&outboundCBM=" + result.innerHTML.slice(result.innerHTML.indexOf("CBM:") + 5);

      // Send the form data asynchronously using AJAX
      $.ajax(
      {
        type: "POST",
        url: "/outbound",
        data: formData,
        success: function(response) 
        {
          // Handle the response if needed (e.g., show a success message)
          console.log("Form data submitted successfully!");

          if(typeof response != "string")
          {
            let div = document.getElementById("listContainer");
            let ul = document.getElementById("myList");
            ul.remove();

            let newUl = document.createElement("ul");
            newUl.id = "myList";

            console.log(response.length)
  
            for(let i = 0; i < response.length; i++)
            {
              let li = document.createElement("li");
              li.innerHTML = "Item " + (i + 1) + ": " + response[i][0] + ", Tracking number: " + response[i][1] + ", CBM: " + response[i][2];
              newUl.appendChild(li);
            }
            div.appendChild(newUl);
  
            outboundListBoxAddActive();
          

            let message = lang === 'CN' ? '完成' : 'Completed';
            showModal(message, lang);
          }else{
            let message = lang === 'CN' ? '出库日期错误' : 'Outbound date error';
            showModal(message, lang);
          }
            
        },
        error: function(error) 
        {
          // Handle errors if any
          console.error("Form submission error:", error);
        }
      });
    }
  });

  preventBeyondDateClicked();

  // Get a reference to the button element using its id
  let button = document.getElementById('chargesBtn');

  // Add a click event listener to the button
  button.addEventListener('click', function() {

      // get lang from url
      let urlParams = new URLSearchParams(window.location.search);
      let lang = urlParams.get('lang');
      // Your code here will run when the button is clicked
      let message = lang === 'CN' ? '输入日期' : 'Select date';
      showModalWithInput(message, lang)
      // You can do other actions here based on your requirements
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
        let data = response.slice(1);
        // Handle the response if needed (e.g., show a success message)
        console.log("Form data submitted successfully!");
        
        //console.log(response);

        // generate storage charges table with response data
        let div = document.getElementById("viewListContainer");
        div.innerHTML = "";

        let table = document.createElement("table");
        table.id = "chargesTable";
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

        data.forEach(row => 
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

 
      },
      error: function(error) 
      {
          // Handle errors if any
          console.error("Form submission error:", error);
      }
    });
  });



    

});


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

// border modifications
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
          //otherLink.style.borderTop = '3px solid #f5f5f5';

          // hide otherLink tab content
          let divElement = document.getElementById(otherLink.getAttribute("href").substring(1));
          divElement.style.display = 'none';
        }
      });
      
      //this.style.borderTop = '3px solid black';

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



    }
    else
    {
      langBtn.innerHTML = 'English';
      urlParams.set('lang', 'CN');
      $("#recordTab").html("登记");
      $("#viewTab").html("查看");
      $("#chargesBtn").html("仓租");
      $("#historyBtn").html("历史记录");



    }
    
    // Get the updated query string
    let updatedQueryString = urlParams.toString();

    // Get the current URL without the query string
    let baseUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;

    // Update the URL with the new query string without refreshing the page
    let newUrl = baseUrl + '?' + updatedQueryString;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

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