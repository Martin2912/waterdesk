export default function(currentLoca = {}, action) {
    if(action.type == 'changeCurrentLoca') {
        return action.location;
    }
    else {
        return currentLoca;
    }
}
