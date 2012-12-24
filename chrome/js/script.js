/** Адрес сайта с источником прогнозов. */
var siteUrl = "http://m.bus55.ru";
/** Путь к странице с прогнозами для указанной остановки. */
var path = "/index.php/app/get_predict/2924";

var completeUrl = siteUrl + path;

//var notificationItem = new NotificationItem(completeUrl, ["4"], 14 * 60 + 30, 16 * 60, 40);

var isActive = true;


getActualPredictions();
// Create a simple text notification:
function getActualPredictions() {
    this.notificationService = new NotificationSerivce();
    var nowDate = new Date();
    var now = nowDate.getHours()*60 + nowDate.getMinutes();
    var gridFromLocalStorage = localStorage.getItem("notificationGrid");
    if (gridFromLocalStorage) {
        for (var i = 0; i < self.notificationService.getLength(); i++) {
            var notificationItem = self.notificationService.getItem(i);
            if (notificationItem.startTime <= now && now <= notificationItem.endTime) {
                checkNotification(notificationItem);
            }
        }
    }
    setTimeout(getActualPredictions, 60000)
}
function checkNotification(notificationItem) {
    if (!notificationItem.isActive) {
        return;
    }
    $.ajax({
        "url":notificationItem.stationUrl,
        "type":"POST",
        "dataType":"html",
        "dataFilter":function (data, type) {
            var result = data;
            while (result.indexOf("src") >= 0) {
                result = result.replace("src", "_");
            }
            while (result.indexOf("href") >= 0) {
                result = result.replace("href", "_");
            }
            return result;
        }
    }).success(function (html) {
            var bullets = $(html).find(".bullet");
            var predictionArray = [];
            for (var i = 0; i < bullets.size(); i++) {
                var bullet = $(bullets[i]);
                if ((bullets.size() == 1) && bullet.text() == 'Прогнозов нет') {
                    return;
                }
                var route = bullet.find("strong")[0].textContent.trim();
                var transportType = bullet.contents().filter(function () {
                    return this.nodeType == 3;
                })[0].textContent.trim();
                var estimateTime = parseInt(bullet.find(".greenBold")[0].textContent.trim());
                if (isNaN(estimateTime)) {
                    estimateTime = 0;
                }
                var predictionItem = new Prediction(route, transportType, estimateTime);
                predictionArray.push(predictionItem);
            }
            checkPredictions(predictionArray, notificationItem);
        })
}

function checkPredictions(predictionArray, notificationItem) {
    for (var i = 0; i < predictionArray.length; i++) {
        var prediction = predictionArray[i];
        if (prediction.timeToCome < notificationItem.timeToCome) {
            if (notificationItem.routes.indexOf(prediction.routeNum) >= 0) {
                showNotification(prediction.transportType, prediction.routeNum, prediction.timeToCome,notificationItem.station)
            }
        }
    }
}

function showNotification(transportType, routeNum, timeToCome, station) {
    var notification = webkitNotifications.createNotification(
        'img/bus_32.gif', // icon url - can be relative
        'Оповещение', // notification title
        station + ": "+capitaliseFirstLetter(transportType) + " " + routeNum + " приходит через " + timeToCome + "мин."
    );

    notification.show();
    var cancelFunction = cancelNotification(notification);
    setTimeout(cancelFunction, 10000);
}

function cancelNotification(notification) {
    this.notification = notification;

    return function () {
        notification.close();
    }
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}










