const fs = require('fs');
let STORAGE_CATALOG = './jsondatastore';
require('dotenv-defaults').config()
let STORAGE_PATH = STORAGE_CATALOG + '/storage.json';

class JsonStorage {   
    static _open() {
        if (!fs.existsSync(STORAGE_CATALOG)) {
            fs.mkdirSync(STORAGE_CATALOG);
            fs.writeFileSync(STORAGE_PATH, '{}');
        } else if (!fs.existsSync(STORAGE_PATH)) {
            fs.writeFileSync(STORAGE_PATH, '{}');
        } 
        return fs.readFileSync(STORAGE_PATH).toString();
    }

    static _write(data) {
        fs.writeFileSync(STORAGE_PATH, data);
    }

    static get(walletid) {
        const content = this._open();
        try {
            const json = JSON.parse(content);
            return json[walletid];
        } catch (e) {
            throw Error(e);
        }
    }

    static set_transaction_hash(walletid, _tokename, txhash){
        //console.log(">>walletid, txhash_for_tokename, txhash >>>",walletid, _tokename, txhash);
        const content = this._open();
        try{  
            const json = JSON.parse(content);
            //console.log(">>>>*******>>>> JSON >>>>****>>>>",json[walletid]);
            let transkey = "txhash_for_"+_tokename;
            json[walletid][transkey]=txhash;
            //console.log("~~~~~~", json[walletid]);
            //console.log(">>>>json[walletid][transkey] <<<<", json[walletid][transkey]);
            this._write(JSON.stringify(json));            
        }catch(e) {
            throw Error(e);
        }        
    }

    static tokentimestamp_checker(walletid, tokenname){
        //console.log("~~~~~~~~~~~~~~~~~~~~~~~!!!!!@@@@@@@@@@@@############$$$$$$$$$$$$$");
        //console.log(">>>>tokenname >>>",tokenname);        
        //console.log("~~~~~~~~~~~~~~~~~~~~~~~!!!!!@@@@@@@@@@@@############$$$$$$$$$$$$$");        
        const content = this._open();              
        try{
            const json = JSON.parse(content);
            //console.log(json[walletid]);                      
            //records are older than 24 hours for given token, update timestamp to new timestamp
            //console.log("For >>", json[walletid][tokenname]);            
            if(typeof json[walletid][tokenname] === 'undefined'){
                    console.log(">>>> Create new entry for token, token not exists ..");    
                    json[walletid][tokenname] = Date.now();
                    this._write(JSON.stringify(json)); 
                    return "SENDIT";
            }else{              
                    if((Date.now() - json[walletid][tokenname]) > parseInt(process.env.NEXT_DESPEND_DURATION)){
                        json[walletid][tokenname] = Date.now();
                        this._write(JSON.stringify(json));
                        console.log("New Timestamp >>>",json[walletid][tokenname]);
                        return "SENDIT";
                    }else{
                        console.log(">>> in else loop >>>");
                        return "DONTSEND";
                    }
            }                    
        } catch (e) {
            throw Error(e);
        }
    }

    
    static set(walletid, value) {
        const content = this._open();
        try {
            const json = JSON.parse(content);
            json[walletid] = value;
            this._write(JSON.stringify(json));
        } catch (e) {
            throw Error(e);
        }
    }

    static delete(walletid) {
        const content = this._open();
        try {
            const json = JSON.parse(content);
            delete json[walletid];
            this._write(JSON.stringify(json));
        } catch (e) {
            throw Error(e);
        }
    }

    static getAllWallets(){
        const content = this._open();
        try{
            const json = JSON.parse(content);
            return Object.keys(json);
        }catch(e){
            throw Error(e);
        }
    }

    static purgeWhole(){
        this.getAllWallets().forEach(key =>{
            console.log("removing Key >>>>", key);
            this.delete(key);
        }); 
    }
}

module.exports = {
    JsonStorage    
}