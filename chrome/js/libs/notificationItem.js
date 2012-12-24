//todo Notification item should contain stationId instead of stationUrl
function NotificationItem(stationUrl, routes, startTime, endTime, timeToCome){
    this.routes=routes;
    this.startTime=startTime;
    this.endTime=endTime;
    this.timeToCome=timeToCome;
    this.stationUrl=stationUrl;
    this.isActive=false;
}

function NotificationSerivce(){
    this.notificationArray=[];
    var self=this;

    function notificationGridProperty(){
        return "notificationGrid";
    }

    var gridFromLocalStorage = localStorage.getItem(notificationGridProperty());
    if (gridFromLocalStorage) {
        self.notificationArray = JSON.parse(gridFromLocalStorage);
    }

    this.addNotification = function (notificationItem){
        self.notificationArray.push(notificationItem);
        localStorage.setItem(notificationGridProperty(), JSON.stringify(self.notificationArray));
    }

    this.removeNotificationItem = function (notificationItem){
        var index=notificationItem.indexOf(notificationItem);
        removeNotificationItemByIndex(index);

    }

    this.removeNotificationItemByIndex = function (index){
        if (index>=0){
            self.notificationArray.splice(index,1);
        }
        localStorage.setItem(notificationGridProperty(), JSON.stringify(self.notificationArray));
    }

    this.getItem= function (index){
        return self.notificationArray[index];
    }

    this.getLength= function(){
        return self.notificationArray.length;
    }

    this.setEnabled=function(index, state){
       self.notificationArray[index].isActive=state;
       localStorage.setItem(notificationGridProperty(), JSON.stringify(self.notificationArray));
    }
}