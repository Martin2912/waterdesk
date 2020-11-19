export default function(aboList = [], action) {
    if(action.type == 'aboListUpdate') {
        return action.aboArray;
    }
    if(action.type == 'aboListDispatch') {
        return action.aboArray;
    }
    else {
        return aboList;
    }
}
