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
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}
app.use(cors());
var COINS_TO_SEND = process.env.COINS_TO_SEND;// 10 * 1000000000000000000;  10 ZCH
var TOKEN_ABI = JSON.parse(process.env.TOKEN_ABI);

var adminWallet = process.env.ADMIN_WALLET;
var NET = process.env.NET; // mainnet, testnet
var CHAINID = process.env.CHAINID; 

const web3 = new Web3(process.env.TESTNET_RPC_URL);
var tokensAllowed = process.env.ALLOWED_TOKENS;

const mydbobj = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE
}

app.post('/dripit', cors(corsOptions), function (req, res, next){    
    var userWallet = req.body.walletid.toString();
    var dripwhat = (req.body.tokenname) ? req.body.tokenname : ''; 
    var userWalletValid = WalletValidator.validate(userWallet, 'ETH');
         
    if(! userWalletValid) {
    	res.send({"ERROR": "Invalid walletid provided"});
    }else if(! tokensAllowed.includes(req.body.tokenname)){
    	res.send({"ERROR": "Invalid tokenname provided"});
    }else{     	
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
	    	        case process.env.ZUSD_TOKEN_NAME.toString():
	    			var peggyamt = process.env.PEGGY_ZUSD;
	    			var _contract = process.env.ZUSD_CONTRACT;
	    			sendPeggy(req, res, next, peggyamt, _contract ,process.env.ZUSD_TOKEN_NAME.toString());
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
    checkDATE(_clientip, userWallet, res, process.env.COIN_NAME.toString()).then((_cnt2) =>{                
       if(_cnt2 < 1){
          web3call_peggy('-', userWallet, res, _clientip, 0, false, process.env.COIN_NAME.toString());
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
    var _query = `SELECT count(*) as cnt2 FROM `+ process.env.FAUCET_TABLE_NAME.toString() +` where net='`+ NET+`' AND token_name='`+ token_name +`' AND client_ip='`+clientip+`' AND client_wallet='`+wallet.toString()+`' AND timestamp >= DATE_SUB(now(), INTERVAL 1 DAY)  ORDER BY id DESC limit 0,1`;        
	console.log(">>> Select Query >>>", _query);
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
        var _query = `insert into `+ process.env.FAUCET_TABLE_NAME.toString() +` (client_ip, client_wallet, txhash, contractused, net, token_name) values ('`+clientip+`','`+userWallet+`','`+xhash+`','`+contractused+`','`+NET+`','`+token_name+`')`;            
		console.log(" >>> Insert Query >>>", _query);
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
		web3.eth.accounts.wallet.add(process.env.ADMIN_PK);
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
    		const token = new web3.eth.Contract(TOKEN_ABI, _contractaddr);    		
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
				myrawTx['value'] = COINS_TO_SEND;           
				myrawTx['gasLimit'] = 30000;       
         		        console.log("RawTx >>>>", myrawTx);             
	           try{       
	                web3.eth.accounts.signTransaction(myrawTx, process.env.ADMIN_PK, function(error,result){
	                   if(! error){
	                       try{                                
	                           var serializedTx=result.rawTransaction;
	                           web3.eth.sendSignedTransaction(serializedTx.toString('hex'))
	                           .on('transactionHash',function(xhash){                                                                                                                      
	                               insertinDB(userWallet, res, clientip, xhash, _contractaddr, process.env.COIN_NAME.toString());                                        
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

app.listen(process.env.PORT_NUM);
