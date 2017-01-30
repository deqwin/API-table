window.dynamicRequire = path => {
    try{
        path = path.replace(/\\/g, '\/');
        console.log(require(path));
        return require(path);
    }catch(error){
        return false;
    }
}