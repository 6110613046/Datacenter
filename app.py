from flask import Flask, request
from linebot.models import *
from linebot import *
import requests
from pymongo import MongoClient
import datetime
import matplotlib.pyplot as plt
import paho.mqtt.client as mqtt


FIREBASE_HOST ="datacenter-3975d-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_AUTH= "7sWhgxLOBU37yOo3swUAIGWvuEhcbRzp1kvm7TwC"
SI = {"Temperature":"°C",
    "Humidity":"%",
    "Temperature2":"°C",
    "Humidity2":"%",
    "AverageI_UPS_20KVA":"A",
    "AverageI_UPS_10KVA":"A",}

broker="broker.hivemq.com"
url = "mongodb://userDatabase:nmgvF9qIPMzClitj@database-shard-00-00.xfjlg.mongodb.net:27017,database-shard-00-01.xfjlg.mongodb.net:27017,database-shard-00-02.xfjlg.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-xa84jq-shard-0&authSource=admin&retryWrites=true&w=majority"
client = MongoClient(url)

db = client.test
collection = db.people

channel_secret = "84c3c6325ea9c1f823ac9168fbd529af"
channel_access_token = "srpbG1MswCsie3vDV/vl80pMHaxEQum7RgNFl3dLP56czsREbDPy0BKmNAvOWRu6I20UNJ4ceubNUTuCOLMIWzWqPtV9E3/2B5ziqa/po3hpdkZ+gmUQnDTpuDjWhWYtj9oWYVl56a57SBcBehHfQQdB04t89/1O/w1cDnyilFU="

def callAPI():
    link = "https://{}/.json?auth={}".format(FIREBASE_HOST,FIREBASE_AUTH)
    response = requests.get(link)
    return response.json()

def getValue(location,province,option,response):   
    try:       
        value = "{} {}".format(response[location][province][option],SI[option] )     
    except:
        value = "ไม่พบข้อมูล"
    return value

app = Flask(__name__)

line_bot_api = LineBotApi(channel_access_token)
handler = WebhookHandler(channel_secret)

@app.route("/callback", methods=['POST'])

def callback():
    body = request.get_data(as_text=True)
    print(body)
    req = request.get_json(silent=True, force=True)
    intent = req["queryResult"]["intent"]["displayName"]
    text = req['originalDetectIntentRequest']['payload']['data']['message']['text']
    reply_token = req['originalDetectIntentRequest']['payload']['data']['replyToken']
    id = req['originalDetectIntentRequest']['payload']['data']['source']['userId']
    disname = line_bot_api.get_profile(id).display_name

    if (intent == "locationAndOption"):
        response = callAPI()
        msg = ''
        #location = req["queryResult"]['parameters']["location"]
        location = ['Thammasat']
        #option = req["queryResult"]['parameters']["option"]
        option = ['AverageI_UPS_10KVA','AverageI_UPS_20KVA','Humidity','Humidity2','Temperature','Temperature2',]
        province = ['PathumThaniDatacenter']

        for p in province:
             msgL = "{} \n\n".format(p)
             for l in location:
                msgL +="{} \n".format(l)
                for o in option:
                    msgL+="{} = {} \n".format(o ,getValue(l,p,o,response))
             msg+= msgL+"\n"

        reply(intent,text,reply_token,id,disname,msg)
        
    elif intent == "Graph":
        plotdate = []
        plottemp = []
        plothum = []
        plottemp2 = []
        plothum2 = []
        I_right = []
        I_left  = []

        dateStartday = req["queryResult"]['parameters']["date1"]
        dateEndday = req["queryResult"]['parameters']["date2"]
        dateStart = req["queryResult"]['parameters']["date-time1"]
        dateEnd = req["queryResult"]['parameters']["date-time2"]
        date1 = dateStartday[0:10]
        datetime1 = dateStart[11:19]
        date2 = dateEndday[0:10]
        datetime2 = dateEnd[11:19]

        myCursor = collection.find({})
        for inventory in myCursor:
            try :
                datey = inventory['date']
            except:
                datey = '0'

            try :
                Temperature = inventory['Temperature']
            except:
                Temperature = '20.0'
                
            try :
                Temperature2 = inventory['Temperature2']
            except:
                Temperature2 = '20.0'

            try :
                Humidity = inventory['Humidity']
            except:
                Humidity = '50.0'

            try :
                Humidity2 = inventory['Humidity2']
            except:
                Humidity2 = '50.0'

            try :
                AverageI_right = inventory['AverageI_right']
            except:
                AverageI_right = '0'

            try :
                AverageI_left = inventory['AverageI_left']
            except:
                AverageI_left = '0'

            if (datey > datetime.datetime.strptime(date1 +'T'+ datetime1, "%Y-%m-%dT%H:%M:%S") and datey < datetime.datetime.strptime(date2 +'T'+ datetime2, "%Y-%m-%dT%H:%M:%S")):
                plotdate.append(datey)
                try :
                    plottemp.append(float(Temperature))
                except:
                    plottemp.append(20.0)  
                try:                 
                    plothum.append(float(Humidity))
                except:
                    plothum.append(float(50.0))
                try :
                    plottemp2.append(float(Temperature2))
                except:
                    plottemp2.append(20.0) 
                try:                 
                    plothum2.append(float(Humidity2))
                except:
                    plothum2.append(float(50.0))
                try :
                    I_right.append(float(AverageI_right))
                except:
                    I_right.append(0.0) 
                try:                 
                    I_left.append(float(AverageI_left))
                except:
                    I_left.append(0.0)


        dates = plotdate
        y = [plottemp,
        plottemp2,
        plothum,
        plothum2,
        I_right,
        I_left]

        fig1, (ax1, ax2) = plt.subplots(2, 1, constrained_layout=True, figsize=(25, 25))
        fig2, (ax3, ax4) = plt.subplots(2, 1, constrained_layout=True, figsize=(25, 25))
        fig3, (ax5, ax6) = plt.subplots(2, 1, constrained_layout=True, figsize=(25, 25))

        ax1.plot(dates, y[0])
        ax2.plot(dates, y[1])
        ax3.plot(dates, y[2])
        ax4.plot(dates, y[3])
        ax5.plot(dates, y[4])
        ax6.plot(dates, y[5])

        # rotate_labels...
        for label in ax1.get_xticklabels():
            label.set_rotation(30)
            label.set_horizontalalignment('right')
        for label in ax2.get_xticklabels():
            label.set_rotation(30)
            label.set_horizontalalignment('right')
        for label in ax3.get_xticklabels():
            label.set_rotation(30)
            label.set_horizontalalignment('right')
        for label in ax4.get_xticklabels():
            label.set_rotation(30)
            label.set_horizontalalignment('right')
        for label in ax5.get_xticklabels():
            label.set_rotation(30)
            label.set_horizontalalignment('right')
        for label in ax6.get_xticklabels():
            label.set_rotation(30)
            label.set_horizontalalignment('right')

        ax1.set_ylabel('Temperature (C)')
        ax2.set_ylabel('Temperature (C)')

        ax3.set_ylabel('Humidity (%)')
        ax4.set_ylabel('Humidity (%)')

        ax5.set_ylabel('Electric current (A)')
        ax6.set_ylabel('Electric current (A)')

        ax1.set_title('Temperature')
        ax2.set_title('Temperature2')

        ax3.set_title('Humidity')
        ax4.set_title('Humidity2')

        ax5.set_title('Electric current UPS 20KVA')
        ax6.set_title('Electric current UPS 10KVA')

        fig1.savefig('static/pics/pic_fig1.jpeg', dpi=100)
        fig2.savefig('static/pics/pic_fig2.jpeg', dpi=100)
        fig3.savefig('static/pics/pic_fig3.jpeg', dpi=100)


        image_reply = ["https://serene-falls-66763.herokuapp.com/static/pics/pic_fig1.jpeg",
        "https://serene-falls-66763.herokuapp.com/static/pics/pic_fig2.jpeg",
        "https://serene-falls-66763.herokuapp.com/static/pics/pic_fig3.jpeg"]

        line_bot_api.reply_message(
            reply_token,
            [TextSendMessage(text="กราฟของอุณหภูมิ 2 จุด ,กราฟของความชื้น 2 จุด และ กราฟของกระแสไฟฟ้า 2 จุด") ,ImageSendMessage(image_reply[0] ,image_reply[0]),
             ImageSendMessage(image_reply[1] , image_reply[1]), ImageSendMessage(image_reply[2] , image_reply[2])])
        

    elif intent == "tempchange":
        number = req["queryResult"]['parameters']['number']
        print(number)
        client = mqtt.Client()
        client.connect(broker)

        num = number[0]
        value = "\"Temperature\": " + str(num)
        my_string = "{" + value + "}"
        client.publish("data/datacenter/project/pakcawat/limitTemp",my_string)


    elif intent == "optionSecond":
        location = req["queryResult"]['outputContexts'][0]['parameters']["location"]
        option = req["queryResult"]['outputContexts'][0]['parameters']["option"]
        reply_cloud(intent,text,reply_token,id,disname,location,option)
    elif intent == "locationSecond":
        location = req["queryResult"]['outputContexts'][0]['parameters']["location"]
        option = req["queryResult"]['outputContexts'][0]['parameters']["option"]
        reply_cloud(intent,text,reply_token,id,disname,location,option)
    
    else:
        try:
            location = req["queryResult"]['outputContexts'][0]['parameters']["location"]
            option = req["queryResult"]['outputContexts'][0]['parameters']["option"]
        except:
            location = ""
            option = ""
            room = ""
    print(body)
    print('id = ' + id)
    print('name = ' + disname)
    print('text = ' + text)
    print('intent = ' + intent)
    print('reply_token = ' + reply_token)
    print('location = '+location)


def reply(intent,text,reply_token,id,disname,msg):
    text_message = TextSendMessage(text=msg)
    line_bot_api.reply_message(reply_token,text_message)

#def reply_en(intent,text,reply_token,id,disname,location,room):
    #text_message = TextSendMessage(text=data[location][option])
    #line_bot_api.reply_message(reply_token,text_message)

def reply_cloud(intent,text,reply_token,id,disname,location,option):
    text_message = TextSendMessage(text=callAPI(location,option))
    line_bot_api.reply_message(reply_token,text_message)

  


if __name__ == "__main__":
    app.run()