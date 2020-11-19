export default function(user = {email:null,token:null,name:null}, action) {
    if(action.type == 'connectUser') {
        console.log("user is :",action.email,action.token, action.name);
        return {email: action.email ,token: action.token, name: action.name};
    } else {
        return user;
    }
}