const { JsonStorage } = require("./faucetclass.js");
const {  transactionSender } = require("./transactionclass.js"); 
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

var tokensAllowed = process.env.ALLOWED_TOKENS;
var COINS_TO_SEND = process.env.COINS_TO_SEND;

app.post('/dripit', cors(corsOptions), function (req, res, next){    
    var userWallet = req.body.walletid.toString();
    var dripwhat = (req.body.tokenname) ? req.body.tokenname : ''; 
    var userWalletValid = WalletValidator.validate(userWallet, 'ETH');
         
    if(! userWalletValid) {
    	res.send({"ERROR": "Invalid walletid provided"});
    }else if(! tokensAllowed.includes(req.body.tokenname)){
    	res.send({"ERROR": "Invalid tokenname provided"});
    }else{     	
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      console.log(">> In app.post block >>");
      console.log(">> for userwallet, dripwhat >>",userWallet,dripwhat);
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
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
})


async function sendCOINS(req, res, next){ 
	var _clientip = req.ip.split(':').pop();    
	var userWallet = req.body.walletid.toString();    
  //console.log(">>> req.body.walletid  >>>", req.body.walletid);    
  const myObject = JsonStorage.get(req.body.walletid.toString())  
  //console.log(">>>>> QQQQQ myObject>>>>>",myObject);
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  console.log(">>>sendCOINS>>>", myObject);
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  if(typeof myObject === 'undefined'){
    console.log("Not found, create new one");
    let myObj = {};
    myObj.wallet = req.body.walletid.toString();
    myObj[req.body.tokenname.toString()] = req.body.tokenname.toString();         
    JsonStorage.set(req.body.walletid.toString(), myObj);
    var txhash = await transactionSender.cointransaction(req.body.walletid.toString(), COINS_TO_SEND, req.body.tokenname.toString(), "-");
    res.send(txhash); 
  }else{
    console.log("Record found check other details");    
    var chk = JsonStorage.tokentimestamp_checker(req.body.walletid.toString(), req.body.tokenname.toString());
    console.log(">>>> chk >>>>",chk);    
    if(chk === "SENDIT"){     
      var txhash = await transactionSender.cointransaction(req.body.walletid.toString(), COINS_TO_SEND, req.body.tokenname.toString(), "-");
      //console.log(">>>> return this hash to user >>>",txhash);
      res.send(txhash);    
    }
    if(chk === "DONTSEND"){ 
      res.status(200).json({"ERROR": "ALREADY GIVEN!"});
    }    
  }
}


async function sendPeggy(req, res, next, peggyamt, _mycontract, tokenname){	
	  var _clientip = req.connection.remoteAddress.split(':').pop();
	  var _userWallet = req.body.walletid.toString();
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(">>>>peggyamt >>>", peggyamt);    
    //console.log(">>> req.body.walletid  >>>", req.body.walletid);    
    const myObject = JsonStorage.get(req.body.walletid.toString())  
    console.log(">>In SendPeggy function, Object >>",myObject);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    if(typeof myObject === 'undefined'){
      console.log("Not found, create new one");
      let myObj = {};
      myObj.wallet = req.body.walletid.toString();
      myObj[req.body.tokenname.toString()] = req.body.tokenname.toString();         
      JsonStorage.set(req.body.walletid.toString(), myObj);
      var txHash = await transactionSender.tokentransaction(req.body.walletid.toString(), peggyamt, req.body.tokenname.toString(), process.env[req.body.tokenname.toString()+"_CONTRACT"]);
      res.send(txHash);    
    }else{
      console.log("Record found check other details");    
      console.log(">>>> req.body.walletid.toString(), req.body.tokenname.toString() >>>>",req.body.walletid.toString(), req.body.tokenname.toString())
      var chk = JsonStorage.tokentimestamp_checker(req.body.walletid.toString(), req.body.tokenname.toString());
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      console.log(">>>> chk >>>>",chk);          
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      if(chk === "SENDIT"){     
        console.log(" >>> in  if conditon, chk [SENDIT] >>>");                                           
        var txHash = await transactionSender.tokentransaction(req.body.walletid.toString(), 10, req.body.tokenname.toString(), process.env[req.body.tokenname.toString()+"_CONTRACT"]);
        console.log(">>>> sendPeggy >>>> return this hash to user >>>>",txHash);        
        res.send(txHash);    
      }
      if(chk === "DONTSEND"){     
        res.status(200).json({"ERROR": "ALREADY GIVEN!"});
      }      
    }                   
}

app.listen(3000);