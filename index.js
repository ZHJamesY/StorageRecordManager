// import modules
let express = require('express');
let session = require('express-session');
require('dotenv').config();

let app = express();
let dataBase = require('./mongoDB.js');
let {v4:uuidv4} = require('uuid');

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
    console.log(`Listening for requests on port ${app.get('port')}.`);
});

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(session({
    // generate session id
    genid: () => uuidv4(),

    // save file: false
    resave: false,

    // save parameters: false
    saveUninitialized: false,

    // signature
    secret: 'Storage',

    // session duration
    cookie: 
    {
        maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    }
}))

app.set('views', __dirname + '/public/views');
app.set('view engine', 'pug');

// dataBase.Rent.find({}).limit(1)
//   .then((rents) => {
//     console.log('First rents:', Object.values(rents[0].Product[0])); or Object.keys
//   })
//   .catch((error) => {
//     console.error('Error finding rents:', error);
//   });

app.get('/', (request, response) => {
    response.render('LogIn', {
        title: 'Log In',
        h1Message: '',
        lang: 'English'
    });
})

// lang == 'CN' for Chinese
// lang == 'ENG' for English

let USERNAME = process.env.user;
let PASSWORD = process.env.password;

// login page
app.post('/login', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let lang = request.query.lang;

    // check if username and password are correct
    if(username == USERNAME && password == PASSWORD)
    {
        // add to session id
        request.session.username = username;

        response.redirect('/Storage?lang=' + lang)
    }
    else
    {
        // render page with error msg for both languages
        if(lang == 'CN')
        {
            response.render('LogIn', {
                title: 'Log In',
                h1Message: '用户名/密码错误。',
                lang: 'English'
            });
        }
        else
        {
            response.render('LogIn', {
                title: 'Log In',
                h1Message: 'Username/Password incorrect.',
                lang: '中文'
            });
        }
    }
});

// storage page
app.get('/Storage', function(request, response){
    let lang = request.query.lang;

    if(lang == 'CN')
    {
        response.render('Storage', {
            title: 'Sparkade Logistics',
            lang: 'English',
            recordTab: '登记',
            viewTab: '查看',
            StorageChargesVar: '仓租',
            historyVar: '历史记录'
        });
    }
    else if(lang == 'ENG')
    {
        response.render('Storage', {
            title: 'Sparkade Logistics',
            lang: '中文',
            recordTab: 'Record',
            viewTab: 'View',
            StorageChargesVar: 'Storage charges',
            historyVar: 'History'
        });
    }
    

    // access only session not expired
    // if(request.session.username)
    // {
    //     if(lang == 'CN')
    //     {
    //         response.render('Storage', {
    //             title: '仓储',
    //             lang: 'English'
    //         });
    //     }
    //     else
    //     {
    //         response.render('Storage', {
    //             title: 'Storage',
    //             lang: '中文'
    //         });
    //     }
    // }
    // else
    // {
    //     if(lang == 'ENG')
    //     {
    //         response.render('LogIn', {
    //             title: 'Log In',
    //             h1expMessage: 'Your session has expired, please log in again.',
    //             lang: '中文'
    //         });
    //     }
    //     else
    //     {
    //         response.render('LogIn', {
    //             title: 'Log In',
    //             h1expMessage: '登录信息已过期, 请重新登录。',
    //             lang: 'English'
    //         });
    //     }
    // }
});

// when inbound save button clicked
app.post('/inbound', async function(request, response)
{
    let date = request.body.date;
    let client = request.body.client.toUpperCase();
    let tracking = request.body.TrackingNum.toUpperCase();
    let CBM = request.body.CBM;

    // record inbound item function
    let result = await inboundItems(client, date, tracking, CBM);

    // else send msg
    if(result == 'Not_New_Client')
    {
        // Send a response back to the client
        response.send('Not_New_Client');
    }
    else
    {
        response.send(result);
    }
});

// when outbound save button clicked
app.post('/outbound', async function(request, response)
{
    let outboundDate = request.body.outboundDate;
    let client = request.body.outboundClient.toUpperCase();
    let tracking = request.body.outboundTrackingNum.toUpperCase();
    let lang = request.body.lang;
    let date = request.body.itemDate;
    let CBM = request.body.outboundCBM;

    // Send a response back to the client
    // response.send('Data received successfully.');

    let parsedInboundDate = new Date(date);
    let parsedOutboundDate = new Date(outboundDate);

    if(parsedInboundDate > parsedOutboundDate)
    {
        response.send("Outbound_Date_Error");
    }
    else if(parsedInboundDate <= parsedOutboundDate)
    {
        let result = await outboundItems(date, outboundDate, client, tracking, CBM, lang);
        response.send(result);
    }

});


// record inbound item, add to array if client exist, else create new client object
async function inboundItems(client, date, tracking, CBM) 
{
    let inboundItem = await dataBase.Inbound.find();
    

    // Check if the client already exists in the collection
    let existingItem = inboundItem.find((item) => item.Client === client);

    if (existingItem) 
    {
        let newItem = [date, tracking, CBM];

        // If client is found, modify data for the existing item
        // insert date using splice() or use push() method, ascending order
        let parsedDate = new Date(date);

        let inserted = false;
        for (let i = 0; i < existingItem.Items.length; i++) {
          let currentDate = new Date(existingItem.Items[i][0]);
          if (parsedDate <= currentDate) {
            existingItem.Items.splice(i, 0, newItem); // Insert the date at the correct position
            inserted = true;
            break;
          }
        }
      
        if (!inserted) 
        {
            // Add the date to the end of the array if it's the latest date
            existingItem.Items.push(newItem);
        }

        await existingItem.save();
    } 
    else 
    {
        let Inbound = dataBase.Inbound;
        // If client is not found, create a new object and save it
        let newItem = new Inbound({
        Client: client,
        Rate: 0.8,
        Items: [[date, tracking, CBM]], // Assuming 'Items' is an array of arrays containing [date, CBM]
        });
        await newItem.save();

        return client;
    }

    return "Not_New_Client";
}

// function manage outbound item
async function outboundItems(date, outboundDate, client, tracking, CBM, lang)
{
    let outboundItem = await dataBase.Inbound.find();

    // Check if the client already exists in the collection
    let currentClient = outboundItem.find((item) => item.Client === client);

    if (currentClient) 
    {
        for(let i = 0; i < currentClient.Items.length; i++)
        {
            if(currentClient.Items[i][0] == date && currentClient.Items[i][1] == tracking)
            {
                let outboundItem = await dataBase.Outbound.find();
    
                // Check if the client already exists in the collection
                let existingItem = outboundItem.find((item) => item.Client === client);
            
                if (existingItem) 
                {
                    let newItem = [date, outboundDate, tracking, CBM];
            
                    // If client is found, modify data for the existing item
                    // insert date using splice() or use push() method, ascending order
                    let parsedDate = new Date(date);
            
                    let inserted = false;
                    for (let i = 0; i < existingItem.Items.length; i++) {
                      let currentDate = new Date(existingItem.Items[i][0]);
                      if (parsedDate <= currentDate) {
                        existingItem.Items.splice(i, 0, newItem); // Insert the date at the correct position
                        inserted = true;
                        break;
                      }
                    }
                  
                    if (!inserted) 
                    {
                        // Add the date to the end of the array if it's the latest date
                        existingItem.Items.push(newItem);
                    }
            
                    await existingItem.save();
                } 
                else 
                {
                    let Outbound = dataBase.Outbound;
                    // If client is not found, create a new object and save it
                    let newItem = new Outbound({
                    Client: client,
                    Rate: 0.8,
                    Items: [[date, outboundDate, tracking, CBM]], // Assuming 'Items' is an array of arrays containing [date, CBM]
                    });
                    await newItem.save();
                }
                currentClient.Items.splice(i, 1);
                await currentClient.save();
                break;
            }
        }
    } 

    return await currentClientItems(client);
}

// send respond to client side
app.get("/allClients", async function(request, response) 
{
    let result = await getAllClients();
    response.json(result)
});

// function to get all client name
async function getAllClients()
{
    let clients = [""];
    let inboundItem = await dataBase.Inbound.find();
    
    // Check if the client already exists in the collection
    inboundItem.find((item) => {
        clients.push(item.Client)
    });

    return clients;
}

// show all items when outbound list clicked
app.post("/allItems", async function(request, response)
{
    let selectedValue = request.body;
    let client = Object.keys(selectedValue)[0];
    let allItems = await currentClientItems(client)

    response.send(allItems);

});

// access selected client's items
async function currentClientItems(clientName) {
    let accounts = await dataBase.Inbound.find();

    let account = accounts.find(function(element) 
    {
        return element.Client === clientName;
    });

    if (account) {
        return account.Items;
    } else {
        return "NotExist";
    }
}

app.post("/charges", async function(request, response)
{
    let chargesDate = request.body.yearMonthInput;

    let result = await storageChargesCal(chargesDate)


    response.send(result);

});

storageChargesCal("2023-08")

async function storageChargesCal(date)
{
    let calLastDay;

    if(getTodayDateIfSameMonth(date) == false)
    {
        calLastDay = getLastDayOfMonth(date);

    }
    else
    {
        calLastDay = getTodayDateIfSameMonth(date)
    }

    let result = [[calLastDay, 0.0]];
    
    // console.log(calLastDay);

    let calFirstDay = getFirstDayOfMonth(date);
    const storageData = await dataBase.Inbound.find({});
    const outboundDate = await dataBase.Outbound.find({});

    // console.log('Data from the "storage" collection:');
    // console.log("Date: " + date);

    for(let i = 0; i < storageData.length; i++)
    {
        result.push([storageData[i].Client, 0.0, []])
        //console.log(result);

        for(let j = 0; j < storageData[i].Items.length; j++)
        {
            //console.log(storageData[i].Items[j][0])

            let itemDate = storageData[i].Items[j][0];
            let daysDifference = calculateDaysDifference(calLastDay, itemDate, true);
            let dateBeforeCalMonth = calculateDaysDifference(itemDate, calFirstDay, false);
            if(daysDifference != -1)
            {
                let calItem = storageData[i].Items[j];

                //console.log(storageData[i].Items[j][0])

                // console.log(storageData[i].Items[j]);

                if(dateBeforeCalMonth == -1)
                {
                    // console.log(itemDate)

                    //console.log(storageData[i].Items[j]);


                    let days = calculateDaysDifference(calLastDay, calFirstDay, "false");
                    let total = (days * storageData[i].Rate * storageData[i].Items[j][2]).toFixed(1);
                    calItem.push(days);
                    calItem.push(total);
                    result[i + 1][2].push(calItem);
                    result[i + 1][1] += parseFloat(total);
                    result[0][1] += parseFloat(total);

                    //console.log(calItem)
                }
                else
                {
                    //console.log(storageData[i].Items[j][0])
                    let days = calculateDaysDifference(calLastDay, itemDate, true);
                    let total = (days * storageData[i].Rate * storageData[i].Items[j][2]).toFixed(1);
                    calItem.push(days);
                    calItem.push(total);
                    result[i + 1][2].push(calItem);
                    result[i + 1][1] += parseFloat(total);
                    result[0][1] += parseFloat(total);


                    //console.log(calItem);


                }

                

                // console.log("cal date: " + calDate);
                // console.log("days difference: " + daysDifference);
                // let calItem = []
                // result.push()
            }
        }

    }

    for(let x = 0; x < outboundDate.length; x++)
    {
        //console.log(outboundDate[x]);
        for(let y = 0; y < outboundDate[x].Items.length; y++)
        {
            //console.log(outboundDate[x].Items[y]);

            let itemInboundDate = outboundDate[x].Items[y][0];
            let itemOutboundDate = outboundDate[x].Items[y][1];
            let daysDifference = calculateDaysDifference(calLastDay, itemInboundDate, true);
            let dateBeforeCalMonth = calculateDaysDifference(itemInboundDate, calFirstDay, false);

            //console.log(daysDifference);

            //console.log(outboundDate[x].Items[y]);


            // filter inbound+7 date is <= calculate month last day/today
            if(daysDifference != -1)
            {
                let calItem = outboundDate[x].Items[y];
                //console.log(outboundDate[x].Items[y]);

                // filter inbound+7 date is < calculate month first day
                if(dateBeforeCalMonth == -1)
                {

                    // console.log("not in 8")
                    //console.log(outboundDate[x].Items[y]);

                    //console.log(dateBeforeCalMonth);

                    // filter outbound date > calculate month first day
                    if(calculateDaysDifference(itemOutboundDate, calFirstDay, "false") != -1)
                    {
                        //console.log("correct item")
                        //console.log(outboundDate[x].Items[y]);

                        // filter outbound date < calculate month last day/today
                        if(calculateDaysDifference(itemOutboundDate, calLastDay, "false") == -1)
                        {
                            let days = calculateDaysDifference(itemOutboundDate, calFirstDay, "false");
                            let total = (days * outboundDate[x].Rate * outboundDate[x].Items[y][3]).toFixed(1);
                            calItem.push(days);
                            calItem.push(total);
                            result[x + 1][2].push(calItem);
                            result[x + 1][1] += parseFloat(total);
                            result[0][1] += parseFloat(total);

                        }
                        else
                        {
                            let days = calculateDaysDifference(calLastDay, calFirstDay, "false");
                            let total = (days * outboundDate[x].Rate * outboundDate[x].Items[y][3]).toFixed(1);
                            calItem.push(days);
                            calItem.push(total);
                            result[x + 1][2].push(calItem);
                            result[x + 1][1] += parseFloat(total);
                            result[0][1] += parseFloat(total);
                        }

                        //console.log(calItem);

                    }


                }         
                else
                {
                    // console.log("in 8")

                    // console.log(outboundDate[x].Items[y]);

                    // let days = calculateDaysDifference(calLastDay, itemInboundDate, true);
                    // let total = (days * outboundDate[x].Rate * outboundDate[x].Items[y][3]).toFixed(1);


                    // console.log(days);
                    // console.log(total);

                    // calItem.push(days);
                    // calItem.push(total);
                    // result[x + 1][2].push(calItem);
                    // result[x + 1][1] += parseFloat(total);
                    // result[0][1] += parseFloat(total);
                    if(calculateDaysDifference(itemOutboundDate, calLastDay, "false") != -1)
                    {
                        //console.log("here")
                        //console.log(outboundDate[x].Items[y]);

                        let days = calculateDaysDifference(calLastDay, itemInboundDate, true);
                        let total = (days * outboundDate[x].Rate * outboundDate[x].Items[y][3]).toFixed(1);


                        //console.log(days);
                        //console.log(total);

                        calItem.push(days);
                        calItem.push(total);
                        result[x + 1][2].push(calItem);
                        result[x + 1][1] += parseFloat(total);
                        result[0][1] += parseFloat(total);

                    }
                    else
                    {
                        // console.log(outboundDate[x].Items[y]);

                        let days = calculateDaysDifference(itemOutboundDate, itemInboundDate, true);

                        //console.log(days);

                        if(days != -1)
                        {
                            //console.log(outboundDate[x].Items[y]);
                            let total = (days * outboundDate[x].Rate * outboundDate[x].Items[y][3]).toFixed(1);
                            calItem.push(days);
                            calItem.push(total);
                            result[x + 1][2].push(calItem);
                            result[x + 1][1] += parseFloat(total);
                            
                            result[0][1] += parseFloat(total);

                        }

                    }

                }       
            }

        }
    }

    // Limit to one decimal place
    result[0][1] = Math.round(result[0][1] * 10) / 10;
    result[1][1] = Math.round(result[1][1] * 10) / 10;
    result[2][1] = Math.round(result[2][1] * 10) / 10;



    //console.log(result);

    return result;

}

// return the last day of argument date in format of yyyy-mm-dd
function getLastDayOfMonth(dateString) 
{
    const [year, month] = dateString.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return formattedDate;
}

// return date of first day of the argument string's date, argument format: yyyy-mm, no dd
function getFirstDayOfMonth(dateString) 
{
    const [year, month] = dateString.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-01`;
    return formattedDate;
}

// calculate days difference between two dates
function calculateDaysDifference(dateString1, dateString2, add7Days) 
{
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);

    if(add7Days == true)
    {
        // Add 7 days(seven days) to date2
        date2.setDate(date2.getDate() + 7);
    }
    else if(add7Days == false)
    {
        // Add 7 days(seven days) to date1
        date1.setDate(date1.getDate() + 7);
    }
    
  
    // Check if dateString2 is not beyond dateString1
    if (date2 > date1) 
    {
      return -1; 
    }
  
    // Calculate the time difference in milliseconds
    const timeDifference = date1.getTime() - date2.getTime();
  
    // Convert milliseconds to days
    let daysDifference = Math.abs(Math.floor(timeDifference / (1000 * 60 * 60 * 24)));
  
    return daysDifference + 1;
}

// check if dateString's month is same as current month
function getTodayDateIfSameMonth(dateString) 
{
    const torontoTimezoneOffset = -4 * 60; // Toronto time offset from UTC (EDT)
    
    // Get the current date in Ontario, Toronto time zone
    const today = new Date(Date.now() + torontoTimezoneOffset * 60 * 1000);
    
    // Parse the input date string and extract the month and year
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Months in JavaScript are 0-indexed (0 - January, 1 - February, etc.)
    
    // Compare if the extracted month and year are the same as today's month and year
    if (today.getFullYear() === year && today.getMonth() === month) {
      // If it's today's month, return today's date in "yyyy-mm-dd" format
      const day = String(today.getDate()).padStart(2, '0'); // Add leading zero if necessary
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${day}`;
      return formattedDate;
    } else {
      // If it's not today's month, return false
      return false;
    }
}

// access data from mongoDB
async function ViewData(clientName) {
    let accounts = await dataBase.Charges.find();
    let exists = accounts.some(function(element) {
        // if(element.Client == clientName)
        // {
        //     return element.Items;
        // }
        console.log(element.Clients[0].Client);
    });
    return "NotExist";
}

//ViewData("123");