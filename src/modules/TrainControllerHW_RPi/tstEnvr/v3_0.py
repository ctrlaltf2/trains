######################################### SYSTEM LIBS ##################################################################################   
import time
import sys
import string
from simple_pid import PID

######################################### CONNECTION LIBRARY ##################################################################################   

import paho.mqtt.client as mqtt

######################################### GPIO LIBRARIES ##################################################################################################################################


from gpiozero import LED, Button, RGBLED, DigitalInputDevice
from colorzero import Color  
import RPi.GPIO as GPIO


################### TODO ###################
#make PID class use engine.py

class OUTPUTGUY(object):
    def __init__(self, name, pin): 
        self.pinNum = pin                               # assign a pin #
        self.deviceName = name                          # name device in use
        GPIO.setmode(GPIO.BCM)  
        GPIO.setup(self.pin, GPIO.OUT)                  # 
        self.currState = (GPIO.input(self.pin) == 1)

    def set(self,state):
        print(f"[OUTPUT]: {self.deviceName} set to, {state}")
        self.currState = state

    def get(self):
        print(f"[OUTPUT]: {self.deviceName} set to, {state}")
        return self.currState

    def changed(self):
        result = (GPIO.input(self.pinNum) == 1) != self.currState
        if result:
            log("[OUTPUT CHANGED]: %s" % (self.deviceName))
        return result
        
    def name(self):
        return self.deviceName
        
    def commit(self):
        print(f"[OUTPUT]: {self.deviceName} set to, {currState}")
        GPIO.output(self.pinNum, self.currState)
 
 
 
 
 
class INPUT(object):
    def __init__(self, name, pin, debounce= 50):
        GPIO.setmode(GPIO.BCM)
        self.deviceName = name
        self.pinNum = pin
        GPIO.setup(self.pinNum, GPIO.IN, pull_up_down = GPIO.PUD_UP)
        self.currState = (GPIO.input(self.pinNum) == 1)

    def get(self):
        print(f"[INPUT]: {self.deviceName} set to, {state}")
        return self.currState
        
    def changed(self):
        result = (GPIO.input(self.pinNum) == 1) != self.currState
        if result:
            log("[INPUT CHANGED]: %s" % (self.deviceName))
        return result
        
    def name(self):
        return self.deviceName
        
    def commit(self):
        self.currState = (GPIO.input(self.pinNum) == 1)
        print("[INPUT COMMIT]: %s is %d" % (self.deviceName, self.currState))

class InOut():
    
    def __init__(self, IDnum = "TCHW0", timeInt = .1):
######################################### GPIO INFO ###################################################################
        #self.gpioguy = GPIOTC()            #all IO used to be in different class but IO integration is easier this way
                    
        self.brake = LED(4)                 #pin 4
        self.Ebrake = LED(17)               #pin 17
        self.brakeFailled = LED(5)          #pin 4
        self.engineFailled = LED(16)        #pin 17    
        self.signalFialled = LED(6)         #pin 4
        self.autoLED = LED(23)
        self.autoButton = Button(24)
        self.prevAutoState = 0
        self.IDnum = IDnum
        self.runAgain = True
######################################### GPIO INIT AND INTERUPT DEFINTIONS #########################################
        
        self.printUpdate = False
        self.timeInt = timeInt
        
        
        
        
######################################### CLIENT INFO ###############################################################

        print(f"New {IDnum} created!")
        #server info
        self.broker = "broker.hivemq.com"
        self.port = 8000
        self.IDnum = IDnum
        self.msg = ""
        self.prevmsg = ""
        self.topicList = ["trains/PID","trains/nonVitals","trains/vitals","trains/updates"]
        
        #create client
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        #update user
                        
                            # TODO
       
        
        ################### TODO ###################
        #poll inputs and send TM in testenv
        #update displays
        #nonvitals use TCHW.py
        
#####################################################################################################################
#########################################   CLIENT AND PUBLISHING FUNCTIONS #########################################
#####################################################################################################################

        
######################################### CALLBACK FUNCTIONS #########################################
                    
    def on_connect(self, client, userdata, flags, rc):
        print(f"CONNECTED w/ CODE: {rc}")
        if (rc == 0):
                # subscribe to all needed topics, which need to put into on_connect
                self.client.subscribe("trains/brake")
                self.client.subscribe("trains/vitals")
                self.client.subscribe("trains/nonvitals")
                self.client.subscribe("trains/updates")
                return True
        else:
                print("FAILED TO SUB")
                return False
                
    
    def on_publish(self):
        if (result > 0):
            print("SEND SUCCESS")
        else:
            print("ERROR FAILED TO SEND w/ CODE {client.rc}")
       

    # the callback function, it will be triggered when receiving messages
    def on_message(self, client, userdata, msg):
        if ((msg.topic in self.topicList) and (msg.payload != self.prevmsg)):
            #TODO
            self.decodeguy(msg)
            
                 
        elif(self.prevmsg == msg.payload):
            print("ERROR! REPEATED MSG: ")
            print(f"{msg.payload}")
            print("PREV MSG: ")
            print(f"{self.prevmsg}")
            
        else:
            print("ERROR! INVALID ENTRY: ")
            print(f"{msg.payload}")
        
        self.prevmsg = msg.payload
        
        
        
######################################### CLIENT INTERFACE FUNCTIONS #########################################
        
        
    def send_msg(self, topic, msg):
        self.client.publish(topic, msg, 1)


    def connect(self):
        print("CONNECTING...")
        self.client.connect("broker.hivemq.com", 1883, 8000)
        #print(f"{msg.topic} {msg.payload}")
        #print("payload is " + str(int(msg.payload)))
        
        #self.decode(msg)
            
                # update TC info
                # if GPIO
                # access GPIO

        
        
        
#####################################################################################################################
#########################################   GPIO FUNCTIONS #########################################
#####################################################################################################################
    # inputs
    # displays 
    #def autoHandler(self):
        
    

    def brakeON(self):
        self.brake.on()
            
    def brakeOFF(self):
        self.brake.off()
            
        
    def EbrakeON(self):
        self.Ebrake.on()
        
            
    def EbrakeOFF(self):
        self.Ebrake.off()
        
        
    def BrakeFail(self):
        self.brakeFailled.on()
        
        
    def SignalFail(self):
        self.signalFialled.on() 
        
                   
    def EngineFail(self):
        self.engineFailled.on()  
        
    def ResetFail(self):
        self.brakeFailled.off()
        self.engineFailled.off()
        self.signalFialled.off()
        
        
    
#####################################################################################################################
#########################################   TRAIN CONTROLLER FUNCTIONS ##############################################
#####################################################################################################################
        # DECODE
        # update gpio
        # update log -> UPDATES TM
        
        
                
    def decodeguy(self, msg):
        if (msg.topic == "trains/vitals"):
            #EMERGENCY BRAKE
            # "eb1"  ON
            if (b"eb1" in msg.payload):
                self.EbrakeON()
                temp = f"!! Emergency Brakes: ON, via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
             # "eb0"   OFF
            elif(b"eb0" in msg.payload):
                self.EbrakeOFF()
                temp = f"!! Emergency Brakes: OFF, via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            #SERVICE BRAKE
            #"sb1" ON
            elif (b"sb1" in msg.payload):
                self.brakeON()
                temp = f"Service Brakes: ON, via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
    
             # "sb0"   OFF
            elif(b"sb0" in msg.payload):
                self.brakeOFF()
                temp = f"Service BrakesO: OFF, via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            # FAILURES
            # "bf1" BRAKE 
            elif (b"bf1" in msg.payload):
                self.BrakeFail()
                temp = f"Brake Failure! via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
            #ef1    ENGINE
            elif (b"ef1" in msg.payload):
                self.SignalFail()
                temp = f"Engine Failure! via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
            #sf1    SIGNAL
            elif (b"sf1" in msg.payload):
                self.EngineFail()
                temp = f"Signal Failure! via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
            #ref    RESET
            elif(b"ref" in msg.payload):
                self.ResetFail()
                temp = f"Failures Reset via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            elif(b"auto1" in msg.payload):
                self.toggle_auto()
                temp = f"Failures Reset via cmd: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
                            
                            
                                        
            else:
                temp = f"stray vital command: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
                
                        
            
            
            

        

msgHandler = InOut('TCHW1')
msgHandler.connect()
while(True):
        if(msgHandler.autoButton.is_pressed):
                msgHandler.client.disconnect()
                print("pressed")
                msgHandler.autoLED.on()
                msgHandler.client.publish("trians/updates", "button pressed")
                msgHandler.client.publish("trians/vitals", "ef1")
        else:
                
                msgHandler.client.loop()
                msgHandler.autoLED.on()
                msgHandler.client.publish("trians/vitals", "ref")
        


