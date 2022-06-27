#include <Arduino.h>
#include <Firebase.h>
#include <FirebaseArduino.h>
#include <FirebaseCloudMessaging.h>
#include <FirebaseError.h>
#include <FirebaseHttpClient.h>
#include <FirebaseObject.h>
#include "ESP8266WiFi.h"
// ใช้สำหรับต่อ internet คณะที่ใช้ wpa2
#include "wpa2_enterprise.h"
// ใช้สำหรับ MQTT
#include <PubSubClient.h>
// ใช้สำหรับ DHT22
#include "DHT.h"
#include <Wire.h>
// ใช้สำหรับ LCD
#include <LiquidCrystal_I2C.h>
// ใช้สำหรับ Current Sensors
#include "EmonLib.h"

char ssid[] = "ENGR_IOT";
char password[] = "tse@iot2018";

struct station_config  stationConf;

#define DHTPIN 14
#define DHTTYPE DHT22
#define PIN_RESET_BUTTON 16
LiquidCrystal_I2C lcd(0x27, 16, 2);

int RESET = 0;
int n = 0;
int incomingByte = 0;
char data[80];

#define FIREBASE_HOST "datacenter-3975d-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "7sWhgxLOBU37yOo3swUAIGWvuEhcbRzp1kvm7TwC"

String provice = "PathumThani";
const char *topic = "data/datacenter/project/pakcawat/information";
const char *topic2 = "data/datacenter/project/pakcawat/information_meterElectric";
const char *mqtt_broker = "broker.hivemq.com";
const char *mqtt_username = "emqx";
const char *mqtt_password = "public";

const int mqtt_port = 1883;
long lastReconnectAttempt = 0;
long tempt1 = 0;
long tempt2 = 0;
float myTemp[6];
float myHum[6];
int Arrayindex = 0;
int len = 4;

EnergyMonitor emon1;                   // Create an instance
double Irms = 0;
double allIrms = 0;
double maxI = 0;
double max1hI = 0;
double min1hI = 1000.0; //initial
double wattUnit = 0.0;
int noIrms = 0;
double finalIrms = 0;

//CT Configuration Only
const int VOLTAGE = 240;
float CT_OFFSET = 64;      //Calibrate this value by your own
const int SAMPLING_RATE = 300;   //Sampling rate

unsigned long currentMillis = millis();
float averageIrms[SAMPLING_RATE] = {0.0};
const long CYCLE_TIME = 30; // Second Unit for sending to cloud every n second
long previousMillis = 0;
long interval = CYCLE_TIME ;

unsigned int loop10 = 0;
double averageI = 0.0;
double watts = 0.0;
unsigned int h24 = 0;
unsigned int m1 = 0;
float totalwatt = 0;
float totalKwatt = 0.0;

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

void setup()
{
  Serial.begin(115200);
  lcd.begin();

  wifi_set_opmode(STATION_MODE);
  os_memcpy(&stationConf.ssid,  ssid, 32);
  os_memcpy(&stationConf.password, password, 64);
  wifi_station_set_config(&stationConf);
  // DO NOT use authentication using certificates
  wifi_station_clear_cert_key();
  wifi_station_clear_enterprise_ca_cert();
  // Authenticate using username/password
  wifi_station_set_wpa2_enterprise_auth(1);
  //wifi_station_set_enterprise_identity((uint8 *)username, strlen(username));
  //wifi_station_set_enterprise_username((uint8 *)username, strlen(username));
  wifi_station_set_enterprise_password((uint8 *)password, strlen(password));

  wifi_station_set_reconnect_policy(true);
  // Connect
  wifi_station_connect();

  emon1.current(A0 , CT_OFFSET);             // Current: input pin, calibration.
  for (int j = 0; j < 20; j++)
  {
    Irms = emon1.calcIrms(1480);
    Serial.println(Irms);
    delay(100);
  }

  // Wait for connect
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("Wifi connecting...");
    delay(500);
  }

  // Print wifi IP addess
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);
  while (!client.connected()) {
    String client_id = "esp8266-client-";
    client_id += String(WiFi.macAddress());
    Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
    if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("Public emqx mqtt broker connected");
    } else {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }
  // publish and subscribe
  client.subscribe(topic);
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  delay(100);
}

void callback(char *topic, byte *payload, unsigned int length) {
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
  Serial.print("Message:");
  for (int i = 0; i < length; i++) {
    Serial.print((char) payload[i]);
  }
  Serial.println();
  Serial.println("-----------------------");
}

boolean reconnect() {
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);
  while (!client.connected()) {
    String client_id = "esp8266-client-";
    client_id += String(WiFi.macAddress());
    Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
    if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("Public emqx mqtt broker connected");
    } else {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }
  client.subscribe(topic);

  return client.connected();
}


void loop()
{
  currentMillis = millis();
  if ((currentMillis - previousMillis) % 500 == 0)
  {

    Irms = emon1.calcIrms(1480);  // Calculate Irms only
    if ( Irms <= 0.1)
      Irms = 0.00;                 //Prevent noise

    if ( Irms > maxI)
      maxI = Irms;
    if ( Irms < min1hI)
      min1hI = Irms;
    if ( Irms > max1hI)
      max1hI = Irms;

    allIrms += Irms;
    noIrms++;

    if (currentMillis - previousMillis > 1000)
    {

      previousMillis = currentMillis;
      averageIrms[loop10 % SAMPLING_RATE] = Irms;
      loop10++;
      h24++;
      m1++;     //1 minute

      if ( noIrms != 0.0)
        finalIrms = allIrms / (double)noIrms;
    }

    if (m1 % SAMPLING_RATE == 0)
    {
      for (int i = 0; i < SAMPLING_RATE ; i++)
        averageI = averageIrms[i] + averageI;
      averageI = averageI / SAMPLING_RATE;


      totalwatt = averageI * VOLTAGE;
      totalKwatt = totalwatt / 1000;
      Serial.print("AverageI = ");
      Serial.println(averageI);
      Serial.print("WattCurrent = ");
      Serial.println(totalKwatt);
      watts = totalKwatt / 12;    //5min unit count

      if (watts > 0.01)
        wattUnit = wattUnit + watts;

      Serial.print("WattUnit = ");
      Serial.println(wattUnit);

      String value_elec = "\"AverageI\": " + String(averageI) ;
      String value_elec2 = ", \"WattCurrent\": " + String(totalKwatt) ;
      String value_elec3 = ", \"WattUnit\": " + String(wattUnit) ;

      value_elec = value_elec + value_elec2 + value_elec3;
      String payload2 =  "{" + value_elec + "}" ;
      payload2.toCharArray(data, (payload2.length() + 1));
      client.publish(topic2, data);

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("min1hI:" + String(min1hI));
      lcd.setCursor(0, 1);
      lcd.print("max1hI:" + String(max1hI));

      loop10 = 0;
      averageI = 0;
      m1 = 0;
    }

    //1H reset min1h, max1h
    if ( h24 >= 3600)
    {
      min1hI = Irms;
      max1hI = Irms;
      h24 = 0;
    }


    // temp and hum
    long time1 = millis();
    long time2 = millis();
    if (time1 - tempt1 >= 60000) {
      myHum[Arrayindex] = dht.readHumidity();
      myTemp[Arrayindex] = dht.readTemperature();
      tempt1 = time1;
      Serial.println("getavg");
      Serial.print(F("Humidity: "));
      Serial.print(myHum[Arrayindex]);
      Serial.print(F("%  Temperature: "));
      Serial.println(myTemp[Arrayindex]);
      Arrayindex = Arrayindex + 1;
    }
    if (time2 - tempt2 >= 300001) {
      Arrayindex = 0;
      float sum1 = 0;
      float sum2 = 0;
      float tempfinal;
      float humfinal;
      for (int i = 0 ; i <= len ; i++) {
        sum1 += myHum[i];
        sum2 += myTemp[i];
      }
      humfinal = sum1 / 5;
      tempfinal = sum2 / 5;
      

      for (int i = 0 ; i <= len ; i++) {
        sum1 += myHum[i];
        sum2 += myTemp[i];
      }
      Serial.println("getfinal");
      Serial.print(F("Humidity: "));
      Serial.print(humfinal);
      Serial.print(F("%  Temperature: "));
      Serial.println(tempfinal);
      Firebase.setFloat("Thammasat/" + provice + "/Humidity", humfinal );
      if (Firebase.failed()) {
        Serial.print("setting /Humidity failed:");
        Serial.println(Firebase.error());
      }
      Firebase.setFloat("Thammasat/" + provice + "/Temperature", tempfinal );
      if (Firebase.failed()) {
        Serial.print("setting /Temperature failed:");
        Serial.println(Firebase.error());
      }
      //"\"a\"" = "a"
      String value = "\"Humidity\": " + String(humfinal) ;
      String value2 = ", \"Temperature\": " + String(tempfinal) ;

      value = value + value2;

      String payload =  "{" + value + "}" ;
      payload.toCharArray(data, (payload.length() + 1));
      client.publish(topic, data);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Temp:" + String(tempfinal));
      lcd.setCursor(0, 1);
      lcd.print("Humidity:" + String(humfinal));
      tempt2 = time2;

      
      Serial.println("end");
    }

    if (!client.connected()) {
      long now = millis();
      if (now - lastReconnectAttempt > 5000) {
        lastReconnectAttempt = now;
        // Attempt to reconnect
        if (reconnect()) {
          lastReconnectAttempt = 0;
        }
        Serial.println("try to connect");
      }
    } else {
      // Client connected

      client.loop();
    }

  }
}
