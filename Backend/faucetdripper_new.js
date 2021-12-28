var mysql = require('mysql');
const { makeDb } = require('mysql-async-simple');
var WalletValidator = require('wallet-validator');
var cors = require('cors');
require('dotenv-defaults').config();
const express = require('express');
var bodyParser = require('body-parser');
const Web3 = require('web3');
const app = express();
var jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(cors());
//var DTH = 0.001 * 1000000000000000000;  // 0.001 DTH
var DTH = 10 * 1000000000000000000;  // 10 DTH
var CONTRACTABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"target","type":"address"},{"indexed":false,"internalType":"bool","name":"frozen","type":"bool"}],"name":"FrozenAccounts","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address[]","name":"recipients","type":"address[]"},{"internalType":"uint256[]","name":"tokenAmount","type":"uint256[]"}],"name":"airdropACTIVE","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"changeSafeguardStatus","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"decrease_allowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"target","type":"address"},{"internalType":"bool","name":"freeze","type":"bool"}],"name":"freezeAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"frozenAccount","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"increase_allowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"manualWithdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"name":"manualWithdrawTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"target","type":"address"},{"internalType":"uint256","name":"mintedAmount","type":"uint256"}],"name":"mintToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"safeguard","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
var NINJATOKEN_ABI = [{"inputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":!1,"inputs":[{"indexed":!0,"internalType":"address","name":"tokenOwner","type":"address"},{"indexed":!0,"internalType":"address","name":"spender","type":"address"},{"indexed":!1,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"internalType":"address","name":"from","type":"address"},{"indexed":!0,"internalType":"address","name":"to","type":"address"},{"indexed":!1,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"delegate","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"delegate","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

var adminWallet = process.env.ADMIN_WALLET;
var PK = process.env.ADMIN_PK;
var DTHURL = process.env.DTH_TESTNET;
var NET = process.env.NET; // mainnet, testnet
var CHAINID = 34; // DTH MAINCHAINID -24, DTH TESTCHAINID - 34

const web3 = new Web3(DTHURL);
const account = web3.eth.accounts.privateKeyToAccount(PK)
var tokensAllowed = ["DTH", "BTC", "BUSD", "DAI", "ETH", "USDC", "USDT", "XRP", "DUSD", "NINJATOKEN"];

const mydbobj = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE
}

app.post('/dripit', cors(), function (req, res, next){
    var userWallet = req.body.walletid.toString();
    var dripwhat = (req.body.tokenname) ? req.body.tokenname : ''; 
    var userWalletValid = WalletValidator.validate(userWallet, 'ETH');
         
    if(! userWalletValid) {
    	res.send({"ERROR": "Invalid walletid provided"});
    }else if(! tokensAllowed.includes(req.body.tokenname)){
    	 res.send({"ERROR": "Invalid tokenname provided"});
    }else{     	
	    switch(dripwhat){
			case "DTH":		
				sendDTH(req, res, next);				
	    			break;    			    		
	    		case "BTC":
	    			var peggyamt = process.env.PEGGY_BTC;
	    			var _contract = process.env.BTC_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract, "BTC");    			
	    			break;
	    		case "BUSD":
	    			var peggyamt = process.env.PEGGY_BUSD;
	    			var _contract = process.env.BUSD_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract, "BUSD");    			
	    			break;
	    		case "DAI":
	    			var peggyamt = process.env.PEGGY_DAI;
	    			var _contract = process.env.DAI_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract,"DAI");    			
	    			break;
	    		case "ETH":
	    			var peggyamt = process.env.PEGGY_ETH;
	    			var _contract = process.env.ETH_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract, "ETH");    			
	    			break;
	    		case "USDC":
	    			var peggyamt = process.env.PEGGY_USDC;
	    			var _contract = process.env.USDC_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract ,"USDC");    			
	    			break;
	    		case "USDT":
	    			var peggyamt = process.env.PEGGY_USDT;
	    			var _contract = process.env.USDT_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract, "USDT");    			
	    			break;
	    		case "XRP":
	    			var peggyamt = process.env.PEGGY_XRP;
	    			var _contract = process.env.XRP_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract, "XRP");
	    			break;
	    	  case "DUSD":
	    			var peggyamt = process.env.PEGGY_DUSD;
	    			var _contract = process.env.DUSD_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract ,"DUSD");
	    			break;
	    	  case "NINJATOKEN":
	    			var peggyamt = process.env.PEGGY_NINJATOKEN;
	    			var _contract = process.env.NINJA_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract, "NINJATOKEN");
	    			break;
	    	  default: 
	    			res.send({"ERROR": "REQUESTED TOKEN NOT VALID"});
	    }	    
    }                                       
})

async function sendDTH(req, res, next){
	var _clientip = req.ip.split(':').pop();    
	var userWallet = req.body.walletid.toString();
	       
   checkDATE(_clientip, userWallet, res, "DTH").then((_cnt2) =>{                
       if(_cnt2 < 1){
          web3call_peggy('-', userWallet, res, _clientip, 0, false, "DTH");
       }
   })                                                     
}

async function sendPeggy(req, res, next, peggyamt, _mycontract, token_name){	
	var _clientip = req.connection.remoteAddress.split(':').pop();
	var _userWallet = req.body.walletid.toString();
			
	checkDATE(_clientip, _userWallet, res, token_name).then((_cnt) =>{
		if(_cnt < 1){				
			web3call_peggy(_mycontract, _userWallet, res, _clientip, peggyamt, true, token_name);
		}
	})
}

async function checkDATE(clientip, wallet, res, token_name){    
    const connection = mysql.createConnection(mydbobj)
	 const db = makeDb()
    //var _query = `SELECT count(*) as cnt2 FROM dth_faucet where net='`+ NET+`' AND client_ip='`+clientip+`' AND client_wallet='`+wallet.toString()+`' AND timestamp >= DATE_SUB(now(), INTERVAL 1 DAY)  ORDER BY id DESC limit 0,1`;
    var _query = `SELECT count(*) as cnt2 FROM dth_faucet where net='`+ NET+`' AND token_name='`+ token_name +`' AND client_ip='`+clientip+`' AND client_wallet='`+wallet.toString()+`' AND timestamp >= DATE_SUB(now(), INTERVAL 1 DAY)  ORDER BY id DESC limit 0,1`;        
    try{
        const x = await db.query(connection, _query);
        if(x[0].cnt2 > 0){
            res.status(200).json({"ERROR": "ALREADY GIVEN!"});
        }else{
            return 0;
        }
    }catch(e){       
    	  console.log(">>><<< Error >>><<<", e);
    	  res.send({"ERROR": e});                  
    }
    finally {
        db.close(connection);
    }
}

async function insertinDB(userWallet, res, clientip, xhash, contractused, token_name){    
    const connection = mysql.createConnection(mydbobj)
    const db = makeDb()
    try{      
        var _query = `insert into dth_faucet (client_ip, client_wallet, txhash, contractused, net, token_name) values ('`+clientip+`','`+userWallet+`','`+xhash+`','`+contractused+`','`+NET+`','`+token_name+`')`;            
        await db.query(connection, _query);
    }catch(e){    	      
        console.log(">>> Error >>>", e);
        res.send({"ERROR": e});          
    }finally {
        db.close(connection);
    }
}

async function insertin_adminLastNoncesDB(nonce){  
	 console.log(">>> @@ nonce >>>",nonce);  
    const connection = mysql.createConnection(mydbobj);
    const db = makeDb();
    try{
    	  var _selectquery = `select lastNonce from adminLastNonces where net='`+NET+`' AND AdminWalletId='`+adminWallet+`'`;    	  
    	  console.log("SELECT QUERY >>>",_selectquery);
		  var row = await db.query(connection, _selectquery);
		  var dblastnonce = 0;
		  if(row[0] !== undefined){
		  		dblastnonce = row[0].lastNonce;
		  }
		  console.log(">>>> dblastnonce >>>",dblastnonce); 
		  console.log(">>>> row.length >>>",row.length); 
		  if(row.length > 0){ 	
	     	  var updatequery = `UPDATE adminLastNonces SET lastNonce=`+nonce+` where net='`+NET+`' AND AdminWalletId='`+adminWallet+`'`;             
	        await db.query(connection, updatequery);
	     }else{
			  var _query = `INSERT into adminLastNonces (AdminWalletId, lastNonce, net) values ('`+adminWallet+`',`+nonce+`,'`+NET+`')`;			  
	        await db.query(connection, _query);	     
	     }
    }catch(e){   	      
        console.log("@@>>> Error >>>",e);          
    }finally {
       db.close(connection);
    }
}

async function web3call_peggy(_contractaddr, userWallet, res, clientip, _peggyamt, _ispeggy, token_name){	
	try{
		web3.eth.accounts.wallet.add(PK);
		const connection = mysql.createConnection(mydbobj);
		const db = makeDb();
		var _query = `select lastNonce from adminLastNonces where net='`+NET+`' AND AdminWalletId='`+adminWallet+`'`;
		console.log("_query >>>>",_query);
		var _row = await db.query(connection, _query);
		console.log("Row length >>>",_row.length);
		var dblastnonce = 0;
		if(_row[0] !== undefined){
			dblastnonce = _row[0].lastNonce;
		}
		console.log("last>> dblastnonce>>>>",dblastnonce);		
		var nonce = await web3.eth.getTransactionCount(adminWallet,"pending");
		console.log(">>> pending nonce >>>>",nonce);	
		var mynonce = dblastnonce;
		if(nonce > dblastnonce){
			mynonce = nonce;					
		}		
		if(_ispeggy){        
			console.log(">> PEGGY TOKEN >> Selected Contract Addr <<", _contractaddr);		    		    		
    		console.log(">> HERE >> userWallet, _peggyamt <<<<", userWallet, _peggyamt);
    		const token = new web3.eth.Contract(NINJATOKEN_ABI, _contractaddr);    		
    		var requiredGas = await token.methods.transfer(userWallet, _peggyamt).estimateGas({from: adminWallet});
    		console.log("@ <<< REQUIRED GAS >> @@", requiredGas);    		
    		await token.methods.transfer(userWallet, _peggyamt).send({from: adminWallet, gas: requiredGas}).then(function (result) {
        		//console.log(result);        		
        		if(result.status){
        			var xhash = result.transactionHash;
        			console.log(">>> result.status >>>", result.status);
        			console.log(">>> result.transactionHash >>>", result.transactionHash);
               insertinDB(userWallet, res, clientip, xhash, _contractaddr, token_name);                                        
               res.send({"userTxHash": xhash});
               insertin_adminLastNoncesDB(mynonce);
        		}        		
    		}).catch(console.log);
    		/*    		
    		var reqGas = await token.methods.balanceOf(userWallet).estimateGas({from: adminWallet});
    		console.log("@<< REQUIRED GAS [ regGas ] >>@", reqGas);
    		setTimeout(()=>{
				const token1 = new web3.eth.Contract(NINJATOKEN_ABI, _contractaddr);  			    			
	    		token1.methods.balanceOf(userWallet).call({from: adminWallet, gas: reqGas}).then(function (result) {
	        		console.log("USER TOKEN BALANCE >>>>>",result);
	    		}).catch(console.log);
    		}, 100000);
    		*/    		    		
    	}else{	
	   	(async function(){                
	      	 web3.eth.getGasPrice().then(gasPrice=>{                                         
	       	  var myrawTx = {   
		                 nonce : web3.utils.toHex(mynonce),                    
		                 gasPrice: web3.utils.toHex(gasPrice),
		                 to: userWallet,
		                 from: adminWallet,                    
		                 chainId: CHAINID 
		        };  
				  myrawTx['value'] = DTH;           
				  myrawTx['gasLimit'] = 30000;       
 
		        console.log("RawTx >>>>", myrawTx);             
	           try{       
	               web3.eth.accounts.signTransaction(myrawTx, PK, function(error,result){
	                   if(! error){
	                       try{                                
	                           var serializedTx=result.rawTransaction;
	                           web3.eth.sendSignedTransaction(serializedTx.toString('hex'))
	                           .on('transactionHash',function(xhash){                                                                                                                      
	                               insertinDB(userWallet, res, clientip, xhash, _contractaddr, "DTH");                                        
	                               res.send({"userTxHash":xhash});
	                               insertin_adminLastNoncesDB(mynonce);                                        
	                           })
	                           .on('error', myerr => { 
	                           	 console.log("@@##@@ ERROR @@##@@", myerr);                                   	 
	                               res.send({"ERROR": myerr.toString()});                                                                                                                    
	                           });	                                                      
	                       }catch(e){              
	                           console.log(">>> Error >>>", e);
	                           res.send({"ERROR": e});
	                       }
	                   }
	               });     
	           }catch(e){                    	   
	               console.log("<><> Error <><>", e);   
	               res.send({"ERROR": e});                                     
	           }               
	       });                 
	   })();
	  }		
	}catch(e){
		console.log(">@><@< Error >@><@<", e);
	}
}

app.listen(3000);