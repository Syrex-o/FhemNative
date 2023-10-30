import { timeFormat, timeParse } from "d3";
import { inputIsNotNullOrUndefined } from "@fhem-native/utils";

import { ForecastDay, HourData } from "../fhem-weather.type";

export function proplantaDataMapper(readings: Record<string, any>){
    const forecast: ForecastDay[] = [];
    const timeVals = ['00', '03', '06', '09', '12', '15', '18', '21'];

    // get forecast days
    const forecastDays = Math.max(...Object.keys(readings).map(x=>{
        const fcDay = x.match('fc\\d');
        if(fcDay && fcDay[0]) return parseInt( fcDay[0].replace('fc', '') );
        return null;
    }).filter(inputIsNotNullOrUndefined));
    
    for(let i = 0; i <= forecastDays; i++){
        const forecastDay: Record<string, any> = { hourData: {} };
        // get relevant readings
        const prefix = `fc${i}_`;
        // date
        if(readings[`${prefix}date`]){
            const date = timeParse('%d.%m.%Y')(readings[`${prefix}date`].Value);
            if(date) forecastDay['date'] =  timeFormat("%d.%m")( date );
        }
        // rain
        forecastDay['rain'] = readings[`${prefix}rain`] ? readings[`${prefix}rain`].Value : 0;
        // tempMax
        if(readings[`${prefix}tempMax`]) forecastDay['tempMax'] = readings[`${prefix}tempMax`].Value;
        // tempMin
        if(readings[`${prefix}tempMin`]) forecastDay['tempMin'] = readings[`${prefix}tempMin`].Value;
        // icons
        if(readings[`${prefix}weatherDayIcon`]){
            forecastDay['weatherIcon'] = readings[`${prefix}weatherDayIcon`].Value;
        }
        else if(readings[`${prefix}weatherIcon`]){
            forecastDay['weatherIcon'] = readings[`${prefix}weatherIcon`].Value;
        }

        // get hourly data
        const timestamps = timeVals.map(hourVal=>{
            try{
                const date = timeParse('%d.%m.%Y')(readings[`${prefix}date`].Value);
                if(!date) return null;
                date.setTime(date.getTime() + ( parseInt(hourVal) *60*60*1000));
                return { hourVal, date }
            }catch(err){
                return null;
            }
        }).filter(inputIsNotNullOrUndefined);

        // temp values
        const tempSeries = [{
            name: 'Temp',
            series: timeVals.map((hourVal, i)=>{
                return {
                    name: timestamps[i].date,
                    value: readings[`${prefix}temp${hourVal}`] ? readings[`${prefix}temp${hourVal}`].Value : null
                }
            }).filter(x=> x.value !== null)
        }];
        const tempData: HourData = {
            min: Math.min(...tempSeries[0].series.map(x=> x.value)) -1, max: Math.max(...tempSeries[0].series.map(x=> x.value)),
            data: tempSeries
        };
        
        // rain values
        const rainSeries = [{
            name: 'Rain',
            series: timeVals.map((hourVal, i)=>{
                return {
                    name: timestamps[i].date,
                    value: readings[`${prefix}rain${hourVal}`] ? readings[`${prefix}rain${hourVal}`].Value : null
                }
            }).filter(x=> x.value !== null)
        }];
        const rainData: HourData = {
            min: 0, max: Math.max(1, Math.max(...rainSeries[0].series.map(x=> x.value))),
            data: rainSeries
        };

        // wind values
        const windSeries = [{
            name: 'Wind',
            series: timeVals.map((hourVal, i)=>{
                return {
                    name: timestamps[i].date,
                    value: readings[`${prefix}wind${hourVal}`] ? readings[`${prefix}wind${hourVal}`].Value : null
                }
            }).filter(x=> x.value !== null)
        }];
        const windData: HourData = {
            min: Math.min(...windSeries[0].series.map(x=> x.value)) -1, max: Math.max(...windSeries[0].series.map(x=> x.value)),
            data: windSeries
        };

        forecastDay['hourData']['temp'] = tempData;
        forecastDay['hourData']['rain'] = rainData;
        forecastDay['hourData']['wind'] = windData;

        forecast.push(forecastDay as ForecastDay);
    }
    return forecast;
}