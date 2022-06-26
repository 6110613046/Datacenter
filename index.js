
// CommonJS
const admin = require('firebase-admin');
const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');
const express = require('express')
const app = express();
const { MongoClient } = require("mongodb");
const ClientLinerequire = require('@line/bot-sdk').Client;

var url = "mongodb://userDatabase:nmgvF9qIPMzClitj@database-shard-00-00.xfjlg.mongodb.net:27017,database-shard-00-01.xfjlg.mongodb.net:27017,database-shard-00-02.xfjlg.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-xa84jq-shard-0&authSource=admin&retryWrites=true&w=majority";
const clientMongo = new MongoClient(url);
const topic = "data/datacenter/project/pakcawat/information data/datacenter/project/pakcawat/information2 data/datacenter/project/pakcawat/information3_meterElectric data/datacenter/project/pakcawat/information_meterElectric data/datacenter/project/pakcawat/limitTemp data/datacenter/project/pakcawat/information_register" ;

channel_secret = "84c3c6325ea9c1f823ac9168fbd529af"
channel_access_token = "srpbG1MswCsie3vDV/vl80pMHaxEQum7RgNFl3dLP56czsREbDPy0BKmNAvOWRu6I20UNJ4ceubNUTuCOLMIWzWqPtV9E3/2B5ziqa/po3hpdkZ+gmUQnDTpuDjWhWYtj9oWYVl56a57SBcBehHfQQdB04t89/1O/w1cDnyilFU="

const ClientLine = new ClientLinerequire({
    channelAccessToken: channel_access_token,
    channelSecret: channel_secret
  });

const fs = require('fs')

//ที่เก็บค่าต่างๆ กำหนดค่าต่างๆ  
var counttemp1 = 0;
var counttemp2 = 0;
var vauletemp1 = null;
var vauletemp2 = null;
var vaulehum1 = null;
var vaulehum2 = null;
var AverageI1 = null;
var AverageI2 = null;
var WattUnit1 = null;
var WattUnit2 = null;
var WattCurrent1 = null;
var WattCurrent2 = null;

var counterror1 = null;
var counterror2 = null;
var counterror3 = null;
var counterror4 = null;


var limit_temp = 28;
const dbName = "test";

//connect database
admin.initializeApp({
    credential: admin.credential.cert({
        "project_id": "datacenter-3975d",
        "private_key_id": "78eb712ee707cf1898caa39227c81f9a14897ca9",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCwRruYLAYpF+h2\nGbjin/CZMfl/Ltchy2ieTagg2ior5pb+E9fiylpY/ipxi7m/7SYt1pRBxds3Srd7\nuHjZQxydZvgAateGeYUXU+lydGxqKI8VV5rZv6W50sWLqqWc24tnd/zKEiFRaDYN\nMSNcRXVXyV0nNtebfmSfSqPQozc8IjwpAcCnf/14TjmpJCqQnDo0qBEFlGhbw9Wb\nCjL69zv3U00R7N/5+b998ZkJA9NsHCBKyOlWYB+8lqV/UsKq0IrUcQ2IILFO9clt\nV2ckxCvObyrumPl/Z0o3QD7XNO/422v5DeLurc0dLRVi7NxySG9oIm5gFw1qMLTj\nZwqBcimvAgMBAAECggEAVNMMtZrFsiOTlLUm/0LIo+dk8HspQdVgeADVfU2OSobR\nNN12nucR184ivXXnwgALxbYCrK3Zob8+EPaBjMbbL7EbeRPwt4Cld0bFSPLWMrVm\nuPXpiYvL42IV9nH89MC+0eDuz4wu5T4Y+HsjUWUJJN+8iEC/Os90+yQPNTg9PZ1L\nKgX6z2DQU5OGey3NrojxAiXV2ladJyrdY24qsl05ka+5T6Ou2526QsMvirn4TRYY\nvH/QJRDrfjbXO1e7qlpWxH3VlcxicW3zLoko9AAdndVw7wyQnG+kc/feWPkrkyy/\nwcYvDJOxNdkhBVRrBR5i/rN62Un+FhkJNvq9dQho9QKBgQD1rnElNjbq60Tka8AZ\ntyXgKiMphi8byG8Z/Kiqc6DGHzJoc4rTgluSg2Wb+6OIGGR50CIcGzOZjwE7eBwg\nbYF9BeUDR9MVyKi3LxAyIoFq3CzuNWdv1aHPqB4XfRTQjrvm8gTWryiha84Qf/uK\nO3LoAeMSunELeiX1l1vpFe15MwKBgQC3rgyoRgSKzjzwpBzKYc/w5shk0cgBQA6B\n3BYYe0JpE3Yn8m2rRee2vgCXSXVToHUuU3SX4iboApDeZ4M08I2SCyXiPhyVYIba\n93xtDisu8J5XVC++EfuZe2zl1yXxT+BZZTMhfFO3T5FdiOtRxYBUdwbXz7T5LIuc\nfBRhi/DllQKBgQC4owoLgkwRjxDubgAoE1mWt3RHj721rpO4vwZvW4jXfLiggT0z\nKgPx/2gMqzhCXrqcRYxs/RBxdmThsanJwSKQuC5docwE0hHh4a/VTdNfYOsvdtku\n1inOazV6R5muB6c1sGtsgKUTc3ahNd3wDC+WJ1zlRVMR4hHHGaKMcNtQuwKBgDz0\nqMSrP9SkrrqZa+iJ300t+XDj4YDwth/IXxjOxvJCACMvo8+ECmqt0VpjiWkwRdMS\n5Q2GgqzaNSNprLRD5GeEBZV4UVoNR5OhMAys+A3C0nleud1U8G8186Su6quTe3uP\nRxGkxc9+u1oUFyvy5Cyjt4SlLITIkKhk0QqyO0alAoGBAMicjkfLWHo+lePCB5zf\npKgVylPVD4bQP+UQMP51YKt1pPFL001gqZlMxArvy9/jc4H5N0DV0XY1i8d7z8eg\nEK3fLqwgi0Hm+rXEzZK8Y4BR6gQ9/1Bmcs5S0FNpio9NojqCUpGIfxVRpRCfJDiG\nJcGijm1UA1S2o8WpDiwdYjKM\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-jire3@datacenter-3975d.iam.gserviceaccount.com",
        "client_id": "115428681060034945833",
    }
    ),
    databaseURL: "https://datacenter-3975d-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.database();

setInterval(function(){ 

    if (vauletemp1 == null){
        counterror1 = counterror1 + 1
        console.log("counterror1");
        //ถ้าข้อมูลไม่ถูกส่งเกิน 6 ชม.
        if(counterror1 > 35){
            var str2 = "ตัววัดอุณหภูมิตรง server ไม่ส่งข้อมูล" 
            ClientLine.broadcast(
                [
                    { type: 'text', text: str2 },
                ]
              )
            counterror1 = null
        }
    }
    if (vauletemp2 == null){
        counterror2 = counterror2 + 1
        console.log("counterror2");
        //ถ้าข้อมูลไม่ถูกส่งเกิน 6 ชม.
        if(counterror2 > 35){
            var str2 = "ตัววัดอุณหภูมิตรง กลางห้อง ไม่ส่งข้อมูล"
            ClientLine.broadcast(
                [
                    { type: 'text', text: str2 },
                ]
              )
            counterror2 = null
        }
    }
    if (AverageI1 == null){
        counterror3 = counterror3 + 1
        console.log("counterror3");
        //ถ้าข้อมูลไม่ถูกส่งเกิน 6 ชม.
        if(counterror3 > 35){
            var str2 = "ตัววัดกระแส UPS 20KVA ไม่ส่งข้อมูล" 
            ClientLine.broadcast(
                [
                    { type: 'text', text: str2 },
                ]
              )
            counterror3 = null
        }
    }
    if (AverageI2 == null){
        counterror4 = counterror4 + 1
        console.log("counterror4");
        //ถ้าข้อมูลไม่ถูกส่งเกิน 6 ชม.
        if(counterror4 > 35){
            var str2 = "ตัววัดกระแส UPS 10KVA ไม่ส่งข้อมูล" 
            ClientLine.broadcast(
                [
                    { type: 'text', text: str2 },
                ]
              )
            counterror4 = null
        }
    }
    sendvalue1(vauletemp1, vaulehum1,vauletemp2, vaulehum2, AverageI1, AverageI2);
    console.log("send to sendvalue1");
}, 600000);//run this thing every 10 mins

// connect topic mqtt
client.on('connect', () => {
    console.log('Connected')
    client.subscribe(topic.split(" "), () => {
        console.log(`Subscribe to topic '${topic}'`)
    })
});

// wait data from topic mqtt
client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString())
    payload = payload.toString()

    if (topic === "data/datacenter/project/pakcawat/limitTemp")
        try {
            payload = JSON.parse(payload);
            limit_temp = payload.Temperature;
            limit_temp = parseFloat(limit_temp);

            console.log(limit_temp);
            var str = 'กำหนดค่าเป็น '+ limit_temp +' สำเร็จแล้ว'

            ClientLine.broadcast(
                [
                    { type: 'text', text: str },
                ]
              );
            
        }
        catch {
            limit_temp = 28;
        }
        finally {
            console.log("success set temp");
        }

    else if (topic === "data/datacenter/project/pakcawat/information") {
        try {
            payload = JSON.parse(payload);
            vauletemp1 = payload.Temperature;
            vauletemp1 = parseFloat(vauletemp1);
            vaulehum1 = payload.Humidity;
            vaulehum1 = parseFloat(vaulehum1);
            console.log("information");
            console.log(vauletemp1);
            console.log(vaulehum1);
            counterror1 = null

            db.ref('Thammasat/PathumThaniDatacenter').update({
                Temperature: vauletemp1.toFixed(2),
                Humidity: vaulehum1.toFixed(2),
            });
        }
        catch {
            vauletemp1 = null;
            vaulehum1 = null;
          }
        finally {
            console.log("success vauletemp1");

        //ถ้าอุณหภูมิสูงเกินที่กำหนด 60 นาที หรือ 6 ครั้ง
        if (vauletemp1 > limit_temp)
        {
            counttemp1 = counttemp1 + 1;
            console.log(counttemp1)
            if(counttemp1 > 5)
            {
                counttemp1 = 0
                var str = 'อุณหภูมิสูงเกิน ' + limit_temp + ' องศาแล้ว ตรงที่ server'
                ClientLine.broadcast(
                [
                    { type: 'text', text: str },
                ]
              );
                console.log(counttemp1);
                console.log("send to line");
            }
        }
    }
    }

    else if (topic === "data/datacenter/project/pakcawat/information2") {
        try {
            payload = JSON.parse(payload);
            vauletemp2 = payload.Temperature;
            vauletemp2 = parseFloat(vauletemp2);
            vaulehum2 = payload.Humidity;
            vaulehum2 = parseFloat(vaulehum2);
            console.log("information2");
            console.log(vauletemp2);
            console.log(vaulehum2);
            counterror2 = null

            db.ref('Thammasat/PathumThaniDatacenter').update({
                Temperature2: vauletemp2.toFixed(2),
                Humidity2: vaulehum2.toFixed(2),
            });
        }
        catch {
            vauletemp2 = null;
            vaulehum2 = null;
          }
        finally {
            console.log("success vauletemp2");
          
        if (vauletemp2 > limit_temp)
        {
            counttemp2 = counttemp2 + 1;
            console.log(counttemp2)
            if(counttemp2 > 5)
            {
                counttemp2 = 0
                var str = 'อุณหภูมิสูงเกิน ' + limit_temp + ' องศาแล้ว ตรงที่ กลางห้อง'
                ClientLine.broadcast(
                    [
                        { type: 'text', text: str },
                    ]
                  )
                console.log(counttemp2)
                console.log("send to line2")
            }
        }
    }
    }

    else if (topic === "data/datacenter/project/pakcawat/information3_meterElectric") {
        try {
            payload = JSON.parse(payload);
            AverageI1 = payload.AverageI;
            AverageI1 = parseFloat(AverageI1);
            WattUnit1 = payload.WattUnit;
            WattUnit1 = parseFloat(WattUnit1);
            WattCurrent1 = payload.WattCurrent;
            WattCurrent1 = parseFloat(WattCurrent1);
    
            console.log("information3_meterElectric");
            console.log(AverageI1);
            console.log(WattUnit1);
            console.log(WattCurrent1);
            counterror3 = null

            db.ref('Thammasat/PathumThaniDatacenter').update({
                AverageI_UPS_20KVA: AverageI1.toFixed(2),
            });
        }
        catch {
            AverageI1 = null;
          }
        finally {
            console.log("success AverageI UPS 20KVA");
            if (AverageI1 < 0.5)
            {
                  var str = "ไฟดับที่ห้อง DataCenter หรือ กระแสไฟลดลงผิดปกติ" 
                  ClientLine.broadcast(
                    [
                        { type: 'text', text: str },
                    ]
                  )        
            }
          }
    }

    else if (topic === "data/datacenter/project/pakcawat/information_meterElectric") {
        try {
            payload = JSON.parse(payload);
            AverageI2 = payload.AverageI;
            AverageI2 = parseFloat(AverageI2);
            WattUnit2 = payload.WattUnit;
            WattUnit2 = parseFloat(WattUnit2);
            WattCurrent2 = payload.WattCurrent;
            WattCurrent2 = parseFloat(WattCurrent2);
    
            console.log("information_meterElectric");
            console.log(AverageI2);
            console.log(WattUnit2);
            console.log(WattCurrent2);
            counterror4 = null

            db.ref('Thammasat/PathumThaniDatacenter').update({
                AverageI_UPS_10KVA: AverageI2.toFixed(2),
            });
        }
        catch {
            AverageI2 = null;
          }
        finally {
            console.log("success AverageI2");
            if (AverageI2 < 0.5)
            {
                  var str = "ไฟดับที่ห้อง DataCenter หรือ กระแสไฟลดลงผิดปกติ" 
                  ClientLine.broadcast(
                    [
                        { type: 'text', text: str },
                    ]
                  );         
            }
          }
    }

    else if (topic === "data/datacenter/project/pakcawat/information_register") {
        try {
            payload = payload.toString();
            console.log(payload);
            var date3 = new Date();
            payload = payload + ' เวลา ' + date3 + '\n' 
            fs.appendFile('Register.log', payload, err => {
                if (err) {
                  console.error(err)
                  return
                }
              });
            
        }
        catch {
            console.log("error add log register");
          }
    }
});

async function sendvalue1(vauleinputtemp1, vauleinputhum1,vauleinputtemp2, vauleinputhum2, averageI1, averageI2) {

    console.log("start startAddData");

    try {
        vauleinputtemp1 = vauleinputtemp1.toFixed(2);
    }
    catch {
        vauleinputtemp1 = vauleinputtemp1;
      }

    try {
        vauleinputhum1 = vauleinputhum1.toFixed(2);
    }
    catch {
        vauleinputhum1 = vauleinputhum1;
      }

    try {
        vauleinputtemp2 = vauleinputtemp2.toFixed(2);
    }
    catch {
        vauleinputtemp2 = vauleinputtemp2;
      }
    
    try {
        vauleinputhum2 = vauleinputhum2.toFixed(2);
    }
    catch {
        vauleinputhum2 = vauleinputhum2;
      }

    try {
        averageI1 = averageI1.toFixed(2);
    }
    catch {
        averageI1 = averageI1;
      }

    try {
        averageI2 = averageI2.toFixed(2);
    }
    catch {
        averageI2 = averageI2;
      }

    console.log(vauleinputtemp1);
    console.log(vauleinputhum1);
    console.log(vauleinputtemp2);
    console.log(vauleinputhum2);
    console.log(averageI1);
    console.log(averageI2);

    db.ref('Thammasat/PathumThaniDatacenter').update({
        Temperature: vauleinputtemp1,
        Humidity: vauleinputhum1,
        Temperature2: vauleinputtemp2,
        Humidity2: vauleinputhum2,
        AverageI_UPS_20KVA: averageI1,
        AverageI_UPS_10KVA: averageI2,
    });

    try {
        var date = new Date();
        var date2 = new Date();

        await clientMongo.connect();
        console.log("Connected correctly to server");
        const db = clientMongo.db(dbName);

        // Use the collection "people"
        const col = db.collection("people");
        date.setHours(date.getHours() + 7);
        date.setDate(date.getDate() + 180);
        //date.setMinutes(date.getMinutes() + 50);

        date2.setHours(date2.getHours() + 7);
        col.createIndex({ "expireAt": 1 }, { expireAfterSeconds: 0 })

        col.insertOne({
            "expireAt": date,
            "Temperature": vauleinputtemp1,
            "Humidity": vauleinputhum1,
            "Temperature2": vauleinputtemp2,
            "Humidity2": vauleinputhum2,
            "AverageI_right": averageI1,
            "AverageI_left": averageI2,
            "date": date2,
        })
        
        // Find one document
        const myDoc = await col.findOne();
        // Print to the console
        console.log(myDoc);
    } catch (err) {
        console.log(err.stack);
    }
    finally {
        console.log("success")
    }

    vauletemp1 = null;
    vauletemp2 = null;
    vaulehum1 = null;
    vaulehum2 = null;
    AverageI1 = null;
    AverageI2 = null;
    WattUnit1 = null;
    WattUnit2 = null;
    WattCurrent1 = null;
    WattCurrent2 = null;

};

const port = process.env.PORT || 5000;;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
