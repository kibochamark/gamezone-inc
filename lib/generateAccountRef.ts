export function genRandonString() {
    var chars = 'ABCDGEF12345678';
    var charLength = chars.length;
    console.log(charLength, chars)
    var result = '';
    for ( var i = 0; i < charLength; i++ ) {
       result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    console.log(result)
    return result;
 }