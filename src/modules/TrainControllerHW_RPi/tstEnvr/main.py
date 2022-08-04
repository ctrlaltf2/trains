

import time
import sys
import string
from simple_pid import PID

#for 
import paho.mqtt.client as mqtt

#import GPIO
from gpiozero import LED, Button, RGBLED
from colorzero import Color     



class OUTPUTGUY(object):
    def __init__(self, name, pin): 
        self.pinNum = pin                               # assign a pin #
        self.deviceName = name                          # name device in use
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
		self.pinNum = pin                               # assign a pin 
		self.deviceName = name    
		GPIO.setup(self.__gpio, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)
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
		print("[INPUT COMMIT]: %s is %d" % (self.deviceName, result))

        
class GPIOTC():
    def __init__(self):
        #setup pins
        self.brake = LED(4)         #pin 4
        self.Ebrake = LED(17)       #pin 17
		self.brakeFail = LED(5)         #pin 4
        self.engineFail = LED(16)       #pin 17    
        self.signalFial = LED(6)         #pin 4
        #self.Ebrake = LED(17)       #pin 17    
    def brakeON(self):
        self.brake.on()
            
    def brakeOFF(self):
        self.brake.off()
            
        
    def EbrakeON(self):
        self.Ebrake.on()
            
    def EbrakeOFF(self):
        self.Ebrake.off()
        
        
    def BrakeFail(self):
        self.brakeFail.on()
        
    def SignalFail(self):
        self.signalFail.on() 
                   
    def EngineFail(self):
        self.engineFail.on()  
        
    def ResetFail(self):
        self.brakeFail.off()
		self.engineFail.off()
		self.signalFail.off()
        
       
 
testguy = GPIOTC()
while(1):
	testguy.BrakeFail
