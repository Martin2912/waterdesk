export default function(tokenNotif = '', action) {
    if(action.type == 'setTokenNotif') {
        console.log("reduceur",action.tokenNotif)
        return action.tokenNotif;
    }
    else {
        return tokenNotif;
    }
}
