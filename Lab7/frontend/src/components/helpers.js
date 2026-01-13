function CapitilizeString(str){
    let arr = str.split(' ');
    arr = arr.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return arr.join(' ');
}

export default {CapitilizeString};