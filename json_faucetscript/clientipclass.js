const fs = require('fs');

let STORAGE_CATALOG = './jsondatastore';
let STORAGE_PATH = STORAGE_CATALOG + '/ipstorage.json';

class ClientIPStorage {   
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

    static get(ip) {
        const content = this._open();
        try {
            const json = JSON.parse(content);
            return json[ip];
        } catch (e) {
            throw Error(e);
        }
    }
    
    static set(ip) {
        const content = this._open();
        try {
            const json = JSON.parse(content);
            json[ip] = Date.now();            
            this._write(JSON.stringify(json));
        } catch (e) {
            throw Error(e);
        }
    }

    static delete(ip) {
        const content = this._open();
        try {
            const json = JSON.parse(content);
            delete json[ip];
            this._write(JSON.stringify(json));
        } catch (e) {
            throw Error(e);
        }
    }

    static getAllips(){
        const content = this._open();
        try{
            const json = JSON.parse(content);
            return Object.keys(json);
        }catch(e){
            throw Error(e);
        }
    }

    static purgeWhole(){
        this.getAllips().forEach(key =>{
            console.log("removing Key >>>>", key);
            this.delete(key);
        }); 
    }
}

module.exports = {
    ClientIPStorage    
}