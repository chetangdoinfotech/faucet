/*****  REQUIREMENT [HITESH SIR ] *****/
/*
we need small script in nodejs with web3
1) this script will work as api 
2) we will pass wallet address and token name in parameter 
3) the script will send 0.001 BNB (token) to that wallet 
4) we will use Bnb for this test
can you do this and send me the script ?
*/

/*
We need to do one more thing in above node js script 
(1) we need to store ip address of user and wallet address in database 
(mongodb or anything better we can use ) 
(2) after we store this data in db we will check if the same ip and wallet is 
requesting BNB in 24 hours ?? if yes then show error message else process
 BNB faucet
*/
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
var BNB = 0.001 * 1000000000000000000;  // 0.001 BNB

var adminWallet = process.env.ADMIN_WALLET
var PK = process.env.ADMIN_PK
var BNBURL = process.env.BNB_TESTNET ? process.env.BNB_TESTNET : 'https://data-seed-prebsc-1-s1.binance.org:8545'
const web3 = new Web3(BNBURL)

//console.log(adminWallet)
//console.log(PK)
//console.log(BNBURL)

const account = web3.eth.accounts.privateKeyToAccount(PK)

app.post('/sendbnb', cors(), function (req, res, next){        
    var _clientip = req.ip.split(':').pop();    
    var userWallet = req.body.walletid            
    var userWalletValid = WalletValidator.validate(userWallet, 'ETH')
    
    if((userWalletValid) && (req.body.tokenname === "BNB")){                   
        checkinDB(_clientip, userWallet, res).then((_cnt)=>{            
            if(_cnt < 1){
                web3call(userWallet, res, _clientip);
            }
            checkDATE(_clientip, userWallet, res).then((_cnt2) =>{                
                if(_cnt2 < 1){
                    web3call(userWallet, res, _clientip);
                }
            })               
        })                
    }else{
        res.json({"ERROR": "Invalid walletid or tokenname provided"})                        
    }        
})

async function checkinDB(clientip, wallet, res){        
    const connection = await myconnect()
    const db = makeDb()
    db.connect(connection)
    var _query1 = `SELECT count(*) as cnt FROM bnb_table where client_ip='`+clientip+`' AND client_wallet='`+wallet.toString()+`' ORDER BY id DESC limit 0,1`;    
    //console.log("QUERY1 >>>>", _query1);   
    try{
        const x = await db.query(connection, _query1);
        if(x === undefined){
            return 0;
        }
        return x[0].cnt;
    }catch(e){
        console.log("Exception >>>>",e);
        res.status(200).json({"ERROR": e});          
    }    
    finally {
        await db.close(connection);
    }
}

async function myconnect(){
    const conn = mysql.createConnection({
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DATABASE
    });
    return conn;
}

async function checkDATE(clientip, wallet, res){
    const connection = await myconnect()
    const db = makeDb()
    var _query = `SELECT count(*) as cnt2 FROM bnb_table where client_ip='`+clientip+`' AND client_wallet='`+wallet.toString()+`' AND timestamp >= DATE_SUB(now(), INTERVAL 1 DAY)  ORDER BY id DESC limit 0,1`;
    //console.log("QUERY2 >>>>", _query);    
    try{
        const x = await db.query(connection, _query);
        console.log(x[0].cnt2);
        if(x[0].cnt2 > 0){
            res.status(200).json({"ERROR": "ALREADY GIVEN!"});
        }else{
            return 0;
        }
    }catch(e){
        console.log("Exception >>>>",e);
        res.status(200).json({"ERROR": e});          
    }
    finally {
        await db.close(connection);
    }
}


async function insertinDB(userWallet, res, clientip, xhash){
    const connection = await myconnect()
    const db = makeDb()
    try{
        var _query = `insert into bnb_table (client_ip, client_wallet, txhash) values ('`+clientip+`','`+userWallet+`','`+xhash+`')`;
        //console.log("Insert Query >>>>", _query);    
        const x = await db.query(connection, _query); 
    }catch(e){
        console.log("Exception >>>>",e);
        res.status(200).json({"ERROR": e});          
    }finally {
        await db.close(connection);
    }
}


function web3call(userWallet, res, clientip){
    try{        
        web3.eth.getTransactionCount(adminWallet,"pending").then((mynonce)=>{
            //console.log("MYNONCE >>>>>",mynonce);
            (async function(){                
                web3.eth.getGasPrice().then(gasPrice=>{                                         
                    const myrawTx = {   
                          nonce : web3.utils.toHex(mynonce),                    
                          gasPrice: web3.utils.toHex(gasPrice),
                          gasLimit: 100000,
                          to: userWallet,
                          from: adminWallet,                      
                          value: BNB,
                          chainId: 97 
                    };                                              
                    try{       
                        web3.eth.accounts.signTransaction(myrawTx, PK, function(error,result){
                            if(! error){
                                try{                                
                                    var serializedTx=result.rawTransaction;     
                                    web3.eth.sendSignedTransaction(serializedTx.toString('hex'))
                                    .on('transactionHash',function(xhash){
                                        console.log("Transaction Hash >>>",xhash)                                                                              
                                        insertinDB(userWallet, res, clientip, xhash)
                                        res.status(200).json({"userTxHash":xhash}) 
                                    })
                                    .on('error', myerr => {
                                        res.status(200).json({"ERROR":myerr})                                                                            
                                    });
                                }catch(e){
                                    console.log(e)
                                }
                            }
                        });     
                    }catch(e){
                        res.status(200).json({"ERROR":e})                                            
                    }               
                });                 
            })();
            }).catch((e)=>{
                res.status(200).json({"ERROR":e})                
            });
    }catch(e){
        console.log(e)
        res.status(200).json({"ERROR":e})                
    }
}

app.listen(3000)