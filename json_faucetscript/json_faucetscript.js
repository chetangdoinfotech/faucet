const { JsonStorage } = require("./faucetclass.js")
const { ClientIPStorage } = require("./clientipclass.js")
const {  transactionSender } = require("./transactionclass.js")
const { UserAgentChecker } = require('./UserAgentChecker.js')
const { checkGoogle } = require('./GoogleChecker.js')
var WalletValidator = require('wallet-validator')

require('dotenv-defaults').config()
const express = require('express')
var cors  = require('cors')
var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()
const app = express()
app.use(jsonParser)

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}  

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.FAUCET_URL);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//// limiter added  25112022
const rateLimit = require('express-rate-limit')
//const limiter_message = 'Your IP Restricted for '+process.env.IP_RESTRICTED_MINUTES.toString()+" mins.";

const limiter = rateLimit({
	windowMs: process.env.IP_RESTRICTED_MINUTES * 60 * 1000, // IP_RESTRICTED_MINUTES minutes 
	max: process.env.MAX_REQUEST_PER_IP, // Limit each IP to MAX_REQUEST_PER_IP requests per `window` (here, per 120 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers  
  message: {"IP_ERROR": 'Your IP Restricted for '+process.env.IP_RESTRICTED_MINUTES.toString()+" mins."},// Too many requests message
})

var tokensAllowed = process.env.ALLOWED_TOKENS;
var COINS_TO_SEND = process.env.COINS_TO_SEND;

var gchecker =  async function(req, res, next){
    var gresponse = await checkGoogle(req.body['g-recaptcha-response']);    
    console.log(gresponse);
    if(gresponse.success){
       console.log(">>> valid user >>>");
       next();
    }else{
      console.log(JSON.stringify(gresponse));
      console.log("Invalid user >>> or time");       
      res.status(200).json({"ERROR": "Google captcha server response return false for user's request"});          
      res.end();
    }
}    

app.post('/faucet', cors(corsOptions), [limiter, gchecker],  function (req, res, next){     
    var userIP = req.ip.split(':').pop();        
    var myrawHeaders = req.rawHeaders;    
    var myrawHeadersObject = {};
    for(var i=0; i<myrawHeaders.length; i++){    
      if(i%2 == 0){        
        myrawHeadersObject[myrawHeaders[i]] = myrawHeaders[i+1];       
      }
    }
    //console.log(">>>>>>> myrawHeadersObject >>>>>",myrawHeadersObject['user-agent');
    var chk = UserAgentChecker.chekuseragent(myrawHeadersObject['user-agent']);          
    if(! chk){
        res.json({"ERROR": "Sorry Bro! you are not valid requester!, can't give you coins/tokens"})                
    }else{    
          //console.log("-->>> req.ip  >>>>", req.ip);                    
          const clientIP = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;         
          var userWallet = req.body.walletid.toString();    
          var dripwhat = (req.body.tokenname) ? req.body.tokenname : ''; 
          var userWalletValid = WalletValidator.validate(userWallet, 'ETH');

          if(! userWalletValid) {
            try{
              res.send(JSON.stringify({"ERROR": "Invalid walletid provided"}));                        
            }catch(e){
              console.log("Error >>>",e);
            }
          }else if(! tokensAllowed.includes(req.body.tokenname)){
            try{
              res.json(JSON.stringify({"ERROR": "Invalid tokenname provided"}));            
            }catch(e){
              console.log("Error >>>>>>", e);
            }
          }else{     	            
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");      
            //console.log(">> In app.post block >> for userwallet, dripwhat >>",userWallet,dripwhat);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");      
            switch(dripwhat){
                  case process.env.COIN_NAME.toString():		
                  sendCOINS(req, res, next);				
                  break;    			    		
                case process.env.BTC_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_BTC;
                  var _contract = process.env.BTC_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.BTC_TOKEN_NAME.toString());    			
                  break;
                case process.env.BUSD_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_BUSD;
                  var _contract = process.env.BUSD_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.BUSD_TOKEN_NAME.toString());    			
                  break;
                case process.env.DAI_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_DAI;
                  var _contract = process.env.DAI_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.DAI_TOKEN_NAME.toString());    			
                  break;
                case process.env.ETH_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_ETH;
                  var _contract = process.env.ETH_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.ETH_TOKEN_NAME.toString());    			
                  break;
                case process.env.USDC_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_USDC;
                  var _contract = process.env.USDC_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.USDC_TOKEN_NAME.toString());    			
                  break;
                case process.env.USDT_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_USDT;
                  var _contract = process.env.USDT_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.USDT_TOKEN_NAME.toString());    			
                  break;
                case process.env.XRP_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_XRP;
                  var _contract = process.env.XRP_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.XRP_TOKEN_NAME.toString());
                  break;
                case process.env.DUSD_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_DUSD;
                  var _contract = process.env.DUSD_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract ,process.env.DUSD_TOKEN_NAME.toString());
                  break;
                case process.env.NINJATOKEN_TOKEN_NAME.toString():
                  var peggyamt = process.env.PEGGY_NINJATOKEN;
                  var _contract = process.env.NINJA_CONTRACT;
                  sendPeggy(req, res, next, peggyamt, _contract, process.env.NINJATOKEN_TOKEN_NAME.toString());
                  break;
                default: 
                  res.send({"ERROR": "REQUESTED TOKEN NOT VALID"});
            }	    
          }    
      }
})


async function sendCOINS(req, res, next){ 
	var _clientip = req.ip.split(':').pop();      
	var userWallet = req.body.walletid.toString();    
  //console.log(">>> req.body.walletid  >>>", req.body.walletid);        
  const myObject = JsonStorage.get(req.body.walletid.toString())  
  //console.log(">>>>> QQQQQ myObject>>>>>",myObject);
  //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  //console.log(">>>sendCOINS>>>", myObject);
  //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  if(typeof myObject === 'undefined'){
    console.log(">>> Not found, create new one >>>");
    let myObj = {};
    myObj.wallet = req.body.walletid.toString();
    //myObj[req.body.tokenname.toString()] = req.body.tokenname.toString();         
    myObj[req.body.tokenname.toString()] = Date.now();
    JsonStorage.set(req.body.walletid.toString(), myObj);
    var txhash = await transactionSender.cointransaction(req.body.walletid.toString(), COINS_TO_SEND, req.body.tokenname.toString(), "-");
    try{
      res.write(JSON.stringify(txhash));  
      res.end();   
    }catch(e){
      console.log("error ...", e);
    }
  }else{
    //console.log("Record found, Check other details!");    
    var chk = JsonStorage.tokentimestamp_checker(req.body.walletid.toString(), req.body.tokenname.toString());
    //console.log(">>>> chk >>>>",chk);    
    if(chk === "SENDIT"){     
      var txhash = await transactionSender.cointransaction(req.body.walletid.toString(), COINS_TO_SEND, req.body.tokenname.toString(), "-");
      //console.log(">>>> return this hash to user >>>",txhash);
      try{
        res.write(JSON.stringify(txhash));  
        res.end();       
      }catch(e){
        console.log("Error..",e);
      }
    }else if(chk === "DONTSEND"){      
        try{   
            //res.json({"ERROR": "ALREADY GIVEN!"});
            //res.write(JSON.stringify({"ERROR": "ALREADY GIVEN!"})); 
            res.status(200).json({"ERROR": "ALREADY GIVEN!"}); 
            //res.end();     
        }catch(e){
            console.log(">>>>> CHK <<<<<<", chk);
            console.log("errrror ....", e);                     
        }
    }else{
      console.log("Do nothing....");
    }    
  }
}


async function sendPeggy(req, res, next, peggyamt, _mycontract, tokenname){	
	  var _clientip = req.connection.remoteAddress.split(':').pop();
	  var _userWallet = req.body.walletid.toString();
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(">>>>peggyamt >>>", peggyamt);        
    const myObject = JsonStorage.get(req.body.walletid.toString())  
    console.log(">>In SendPeggy function, Object >>",myObject);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    if(typeof myObject === 'undefined'){
      console.log("Not found, create new one");
      let myObj = {};
      myObj.wallet = req.body.walletid.toString();
      //myObj[req.body.tokenname.toString()] = req.body.tokenname.toString();         
      myObj[req.body.tokenname.toString()] = Date.now();
      JsonStorage.set(req.body.walletid.toString(), myObj);
      var txHash = await transactionSender.tokentransaction(req.body.walletid.toString(), peggyamt, req.body.tokenname.toString(), process.env[req.body.tokenname.toString()+"_CONTRACT"]);
      try{
        res.write(JSON.stringify(txHash));   
        res.end(); 
      }catch(e){
        console.log("Error..",e);
      }
    }else{
      console.log("Record found check other details");    
      console.log(">>>> req.body.walletid.toString(), req.body.tokenname.toString() >>>>",req.body.walletid.toString(), req.body.tokenname.toString())
      var chk = JsonStorage.tokentimestamp_checker(req.body.walletid.toString(), req.body.tokenname.toString());
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      console.log(">>>> chk >>>>",chk);          
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      if(chk === "SENDIT"){     
        console.log(" >>> in  if conditon, chk [SENDIT] >>>, peggyamt >>",peggyamt);                                           
        var txHash = await transactionSender.tokentransaction(req.body.walletid.toString(), peggyamt, req.body.tokenname.toString(), process.env[req.body.tokenname.toString()+"_CONTRACT"]);
        console.log(">>>> sendPeggy >>>> RETURn this hash to user >>>>",txHash);        
        //res.send(txHash);            
        res.json(txHash);        
      }
      if(chk === "DONTSEND"){     
        res.status(200).json({"ERROR": "ALREADY GIVEN!"});
      }      
    }                   
}

app.listen(6060, function(){
  console.log("faucet api ..listening port 6060 ...");
});
