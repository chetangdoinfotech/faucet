const fs = require('fs');
const { JsonStorage } = require("./faucetclass.js");
require('dotenv-defaults').config();
let STORAGE_FOLDER = './jsondatastore';
let STORAGE_PATH = STORAGE_FOLDER + '/admin.json';

const Web3 = require('web3');
var COINS_TO_SEND = process.env.COINS_TO_SEND;// 10 * 1000000000000000000;  10 DTH
var TOKEN_ABI = JSON.parse(process.env.TOKEN_ABI);

var adminWallet = process.env.ADMIN_WALLET;
var NET = process.env.NET; // mainnet, testnet
var CHAINID = process.env.CHAINID; 

const web3 = new Web3(process.env.TESTNET_RPC_URL);

var tokensAllowed = process.env.ALLOWED_TOKENS;

class transactionSender{    
    static _open() {
        if (!fs.existsSync(STORAGE_FOLDER)) {
            fs.mkdirSync(STORAGE_FOLDER);
            fs.writeFileSync(STORAGE_PATH, '{}');
        } else if (!fs.existsSync(STORAGE_PATH)) {
            fs.writeFileSync(STORAGE_PATH, '{}');
        }

        return fs.readFileSync(STORAGE_PATH).toString();
    }

    static getnonce(){
        const content = this._open();
        try {
            const json = JSON.parse(content);
            return json;
        } catch (e) {
            throw Error(e);
        }
    }

    static _write(data) {
        try{            
            fs.writeFileSync(STORAGE_PATH, data);
        }catch(e){
            console.log("Error >>>",e);
        }
    }

    static setnonce(_newnonce){
        //console.log("~~~~~~~~~$$$$$$~~~~~~~~~~");
        //console.log("_newnonce >>>", _newnonce);
        //console.log("~~~~~~~~~$$$$$$~~~~~~~~~~");
        const content = this._open();        
        try{
            const json = JSON.parse(content);
            //console.log(">>>json <<<<~~~~~",json);
            //console.log(">>>json <<<<~~~~~",json['lastnonce']);
            if(_newnonce){                
                console.log("!! setnonce, if condition, _newnonce !!",_newnonce);    
                json['lastnonce'] = _newnonce;
                this._write(JSON.stringify(json));
                return 1;
            }else{          
                console.log("!! setnonce, else condition, _newnonce !!",_newnonce);    
                json['lastnonce'] = parseInt(this.getnonce()['lastnonce'])+1;                                
                this._write(JSON.stringify(json));
                return 1;                
            }                        
        }catch(e){
            throw Error(e);
        }
    }

    static async cointransaction(_userwallet, _peggyamt, _tokename, _contractaddr){                                
        //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        //console.log("******userwallet, peggyamt, _tokename, _contractaddr >>>>>", _userwallet, _peggyamt, _tokename, _contractaddr);
        //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");        
        try{
            web3.eth.accounts.wallet.add(process.env.ADMIN_PK);            
            let dblastnonce = parseInt(this.getnonce()['lastnonce']);                
            //console.log("last>> dblastnonce>>>>",dblastnonce);		
            //console.log("##############################################");
            //console.log("##############################################");
            //console.log(">>>> process.env.ADMIN_WALLET >>>>>",process.env.ADMIN_WALLET);
            var nonce = await web3.eth.getTransactionCount(process.env.ADMIN_WALLET, "pending");            
            //console.log(">>> pending nonce >>>>",nonce);	
            //console.log("##############################################");
            //console.log("##############################################");            
            var mynonce = dblastnonce;
            if(nonce > dblastnonce){
                mynonce = nonce;					
            }

            let gasPrice = await web3.eth.getGasPrice();                                         
            let myrawTx = {   
                nonce : web3.utils.toHex(mynonce),                                    
                gasPrice: web3.utils.toHex(gasPrice),                
                to: _userwallet,
                from: adminWallet,                    
                chainId: CHAINID 
            };  
        
            myrawTx['value'] = _peggyamt;  // Uncomment this
            //myrawTx['value'] = 1000000000000;          
            myrawTx['gasLimit'] = 30000; 
            console.log(">>>> MYRAW TX >>>>",myrawTx);            
            try{       
                var hashx = await web3.eth.accounts.signTransaction(myrawTx, process.env.ADMIN_PK, function(error,result){
                    if(! error){
                        try{                                
                            var serializedTx=result.rawTransaction;                       
                            web3.eth.sendSignedTransaction(serializedTx.toString('hex'))
                            .on('transactionHash',function(xhash){                      
                                //console.log("x hash >>>>>",xhash);
                                //Transaction hash can be stored but commented as json file size will get increase, if needed uncomment it it will work
                                //JsonStorage.set_transaction_hash(_userwallet, process.env.COIN_NAME, xhash);                                                                                
                                //console.log(">@@@@@@>>>mynoncemynonce  >$$$$>>>",mynonce);
                                var z = transactionSender.setnonce(mynonce);                                 
                            })
                            .on('error', myerr => { 
                                //console.log("@@##@@ ERROR @@##@@", myerr);                                   	                                 
                                return({"ERROR": myerr.toString()});                                                                                                                   
                            });                                                        
                        }catch(e){              
                            //console.log(">>> Error >>>", e);                            
                            return({"ERROR": e.toString()});
                        }
                    }
                });     
                return({"userTxHash": hashx.transactionHash});                                
            }catch(e){                    	   
                //console.log("<><> Error <><>", e);                   
                return({"ERROR": e.toString()});                             
            }
        }catch(e){
            console.log("EEE>>",e);
        }
    }

    static async tokentransaction(userwallet, peggyamt, _tokename, _contractaddr){                                    
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log(">>>>> userwallet, peggyamt, _tokename, _contractaddr >>>>>", userwallet, peggyamt, _tokename, _contractaddr);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            
            try{
                web3.eth.accounts.wallet.add(process.env.ADMIN_PK);
                let dblastnonce = parseInt(this.getnonce()['lastnonce']);                
                //console.log("last>> dblastnonce>>>>",dblastnonce);		
                var nonce = await web3.eth.getTransactionCount(adminWallet,"pending");
                //console.log(">>> pending nonce >>>>",nonce);	
                var mynonce = dblastnonce;
                if(nonce > dblastnonce){
                    mynonce = nonce;					
                }		
                const token = new web3.eth.Contract(TOKEN_ABI, _contractaddr);    		
                var requiredGas = await token.methods.transfer(userwallet, peggyamt).estimateGas({from: process.env.ADMIN_WALLET});
                //console.log("@ <<< REQUIRED GAS >> @@", requiredGas);    		
                return await token.methods.transfer(userwallet, peggyamt).send({from: process.env.ADMIN_WALLET, gas: requiredGas}).then(function (result) {                    
                    if(result.status){
                        var xhash = result.transactionHash;
                        //console.log(">>> result.status >>>", result.status);
                        //console.log(">>> result.transactionHash >>>", result.transactionHash);                                                
                        //Transaction hash can be stored but commented as json file size will get increase, if needed uncomment it it will work
                        //JsonStorage.set_transaction_hash(userwallet, _tokename, result.transactionHash);                                                                                      
                        var z = transactionSender.setnonce(mynonce);                  
                        return({"userTxHash": result.transactionHash})                                        
                    }        		
                }).catch(console.log);   		    		                
            }catch(e){
                console.log(">@><@< Error >@><@<", e);
            }            
    }   
}

module.exports ={
     transactionSender     
}