/** Прогноз прибытия транспорта
 *  routeNum        номер маршрута
 *  transportType   тип транспорта
 *  timeToCome      время до прибытия */
function Prediction(routeNum, transportType, timeToCome) {
    this.routeNum = routeNum;
    this.transportType = transportType;
    this.timeToCome = timeToCome;
    this.isActive=false;
}

function PredictionService(){
   function add(prediction){

   }
}