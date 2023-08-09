// Add "g-recaptcha-response": captcha.toString()   in html file in in $ajax data with walletid
// for google captcha
const axios = require('axios');
const FormData = require('form-data');

async function checkGoogle(_response){      
    try{               
        let data = new FormData();
        data.append('secret', process.env.GOOGLE_CAPTCHA_SERVER_SECRET.toString());
        data.append('response', _response);

        let config = { method: 'post', url: 'https://www.google.com/recaptcha/api/siteverify', headers:{...data.getHeaders()},  data: data};
        const google_response = await axios(config);    
        return google_response.data;                
    }catch(e){
        console.log(e);
        return false;
    }
}    

module.exports = {
    checkGoogle
}