$(document).ready(function()
{
    // Initial update
    updateWorldClock();

    // Update every second
    setInterval(updateWorldClock, 1000); 

})

function updateClock(city, offset) 
{
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utc + (3600000 * offset));
    const timeElement = document.getElementById(city);
    timeElement.textContent  = localTime.toLocaleTimeString();
}

function updateWorldClock() 
{
    updateClock('newyork', -5);
    updateClock('london', 0);
    updateClock('paris', 1);
    updateClock('beijing', 8);
    updateClock('ottawa', -4);
    updateClock('sydney', 10);
}
