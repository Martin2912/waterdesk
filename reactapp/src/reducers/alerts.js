export default function(alertsData = [], action) {
    if(action.type == 'setUserAlerts') {
        return action.alertsArr;
    }
    else {
        return alertsData;
    }
}
