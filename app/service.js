window.dynamicRequire = path => {
    try{
        path = path.replace(/\\/g, '\/');
        console.log(require(path));
        return require(path);
    }catch(error){
        console.log(error);
        return false;
    }
};

window.jsonUnformat = content => {
    
    let resultStr = '';
    resultStr = content.replace(/\ +/g, ""); //去掉空格
    resultStr = content.replace(/[ ]/g, "");    //去掉空格
    resultStr = content.replace(/[\r\n]/g, ""); //去掉回车换行

    return resultStr;
}