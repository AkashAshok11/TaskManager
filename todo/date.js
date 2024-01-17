module.exports.getDate = getDate;
function getDate(){
    const date = new Date();
    const options = {
            weekday : 'long',
            month : 'long',
            day : 'numeric'
    };
    const curr = date.toLocaleString('en-US', options);
    return curr;
}
