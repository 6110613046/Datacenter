#include <Firebase.h>
#include <FirebaseArduino.h>
#include <FirebaseCloudMessaging.h>
#include <FirebaseError.h>
#include <FirebaseHttpClient.h>
#include <FirebaseObject.h>
#include <ESP8266WiFi.h>
#include "DHT.h"
#define DHTPIN 14
#define DHTTYPE DHT22

// Set these to run example.
#define FIREBASE_HOST "datacenter-3975d-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "7sWhgxLOBU37yOo3swUAIGWvuEhcbRzp1kvm7TwC"
#define WIFI_SSID "Noey"
#define WIFI_PASSWORD "666noey888"

DHT dht(DHTPIN, DHTTYPE);
void setup() {
  Serial.begin(9600);

  // connect to wifi.
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("connecting");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("connected: ");
  Serial.println(WiFi.localIP());
  
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

int n = 0;

void loop() {
  
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float f = dht.readTemperature(true);

  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }
  float hif = dht.computeHeatIndex(f, h);
  float hic = dht.computeHeatIndex(t, h, false);

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.print(F(" C "));
  Serial.print(f);
  Serial.print(F(" F  Heat index: "));
  Serial.print(hic);
  Serial.print(F(" C "));
  Serial.print(hif);
  Serial.println(F(" F"));
  
  // set value
  Firebase.setFloat("Humidity", h);
  // handle error
  if (Firebase.failed()) {
      Serial.print("setting /Humidity failed:");
      Serial.println(Firebase.error());  
      return;
  }
 
  Firebase.setFloat("Temperature", t);
  // handle error
  if (Firebase.failed()) {
      Serial.print("setting /Temperature failed:");
      Serial.println(Firebase.error());  
      return;
  }


  /* get value 
  Serial.print("number: ");
  Serial.println(Firebase.getFloat("number"));
  delay(1000);*/

  /* remove value
  Firebase.remove("number");
  delay(1000);*/

  /* set string value
  Firebase.setString("message", "hello world");
  if (Firebase.failed()) {
      Serial.print("setting /message failed:");
      Serial.println(Firebase.error());  
      return;
  }
  delay(1000);*/
  
  /* set bool value
  Firebase.setBool("truth", false);
  // handle error
  if (Firebase.failed()) {
      Serial.print("setting /truth failed:");
      Serial.println(Firebase.error());  
      return;
  }
  delay(1000);*/

  /* append a new value to /logs
  String name = Firebase.pushInt("logs", n++);
  // handle error
  if (Firebase.failed()) {
      Serial.print("pushing /logs failed:");
      Serial.println(Firebase.error());  
      return;
  }
  Serial.print("pushed: /logs/");
  Serial.println(name);
  delay(1000);*/
}
