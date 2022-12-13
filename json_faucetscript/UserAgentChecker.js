class UserAgentChecker{
    constructor(){

    }
    static chekuseragent(UserAgentStr){
        //console.log("HHHHHH >>>>>>");
        //var str = 'curl/7.64.1';
        //var str = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.42';
        //console.log(">>> UsERRRRRRAgent >>>>", UserAgentStr);
        var validContent = ['AppleWebKit', 'Mozilla', 'Gecko', 'Safari', 'Google', 'Nexus', 'Opera', 'OPR', 'Edge'];
        var mycheker=0;
        var i=0;
        validContent.forEach(myagent =>{            
            i++;
            //console.log(">>>>> str.indexOf(myagent) >>>>",myagent, UserAgentStr.indexOf(myagent));
            if(UserAgentStr.indexOf(myagent) > -1){
                //console.log("FOUND >>>>",myagent);
                mycheker=1;                        
            }      
        });
        return mycheker;
    }
}

module.exports = {
    UserAgentChecker
}