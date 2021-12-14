var mysql = require('mysql');
const { makeDb } = require('mysql-async-simple');
var WalletValidator = require('wallet-validator')
var cors = require('cors')
require('dotenv-defaults').config()
const express = require('express')
var bodyParser = require('body-parser')
const Web3 = require('web3')
const app = express()
var jsonParser = bodyParser.json()
app.use(jsonParser)
app.use(cors())
var DTH = 0.001 * 1000000000000000000;  // 0.001 DTH

var adminWallet = process.env.ADMIN_WALLET;
var PK = process.env.ADMIN_PK;
var DTHURL = process.env.DTH_TESTNET;
const web3 = new Web3(DTHURL);

const account = web3.eth.accounts.privateKeyToAccount(PK)

const mydbobj = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE
}

app.post('/senddth', cors(), function (req, res, next){        
    var _clientip = req.ip.split(':').pop();    
    var userWallet = req.body.walletid.toString();        
    var userWalletValid = WalletValidator.validate(userWallet, 'ETH');
	     
    if(! userWalletValid) {
    	res.send({"ERROR": "Invalid walletid provided"});
    }
    else if(req.body.tokenname !== "DTH"){
    	res.send({"ERROR": "Invalid tokenname provided"});
    }
    else{           
      checkDATE(_clientip, userWallet, res).then((_cnt2) =>{                
          if(_cnt2 < 1){
              web3call(userWallet, res, _clientip);
          }
      })                      
    }                                        
})

async function checkDATE(clientip, wallet, res){    
    const connection = mysql.createConnection(mydbobj)
	 const db = makeDb()
    var _query = `SELECT count(*) as cnt2 FROM dth_faucet where client_ip='`+clientip+`' AND client_wallet='`+wallet.toString()+`' AND timestamp >= DATE_SUB(now(), INTERVAL 1 DAY)  ORDER BY id DESC limit 0,1`;    
    try{
        const x = await db.query(connection, _query);
        if(x[0].cnt2 > 0){
            res.status(200).json({"ERROR": "ALREADY GIVEN!"});
        }else{
            return 0;
        }
    }catch(e){       
    	  console.log(">>> Error >>>", e);
    	  res.send({"ERROR": e});                  
    }
    finally {
        await db.close(connection);
    }
}

async function insertinDB(userWallet, res, clientip, xhash){    
    const connection = mysql.createConnection(mydbobj)
    const db = makeDb()
    try{
        var _query = `insert into dth_faucet (client_ip, client_wallet, txhash) values ('`+clientip+`','`+userWallet+`','`+xhash+`')`;            
        await db.query(connection, _query);
    }catch(e){    	      
        console.log(">>> Error >>>", e);
        res.send({"ERROR": e});          
    }finally {
        await db.close(connection);
    }
}

function web3call(userWallet, res, clientip){
    try{        
        web3.eth.getTransactionCount(adminWallet,"pending").then((mynonce)=>{            
            (async function(){                
                web3.eth.getGasPrice().then(gasPrice=>{                                         
                    const myrawTx = {   
                          nonce : web3.utils.toHex(mynonce),                    
                          gasPrice: web3.utils.toHex(gasPrice),
                          gasLimit: 100000,
                          to: userWallet,
                          from: adminWallet,                      
                          value: DTH,
                          chainId: 24 
                    };                                              
                    try{       
                        web3.eth.accounts.signTransaction(myrawTx, PK, function(error,result){
                            if(! error){
                                try{                                
                                    var serializedTx=result.rawTransaction;     
                                    web3.eth.sendSignedTransaction(serializedTx.toString('hex'))
                                    .on('transactionHash',function(xhash){                                                                                                                      
                                        insertinDB(userWallet, res, clientip, xhash);
                                        res.send({"userTxHash":xhash});                                        
                                    })
                                    .on('error', myerr => {                                    	 
                                        res.send({"ERROR":myerr});                                                                                                                    
                                    });
                                }catch(e){              
                                    console.log(">>> Error >>>", e);
                                    res.send({"ERROR": e});
                                }
                            }
                        });     
                    }catch(e){                    	   
                        console.log(">>> Error >>>", e);   
                        res.send({"ERROR": e});                                     
                    }               
                });                 
            })();
            }).catch((e)=>{            	 
                console.log(">>> Error >>>", e);
                res.send({"ERROR": e});                
            });
    }catch(e){    	  
        console.log(">>> Error >>>", e);                
    }
}

app.listen(3000);