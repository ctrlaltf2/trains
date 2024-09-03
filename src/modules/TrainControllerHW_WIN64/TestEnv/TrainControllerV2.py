from simple_pid import PID
import sys
import time
#import TrainModel somehow
from subprocess import check_output

class TrainController():
    def __init__(self,
                #TrainModel
                cmdV = 0.0,
                currV = 0,
                auth = 0,
                IDnum = 0):
        
        ######################## train info ####################
        self.IDnum = IDnum
        self.auto = True
        # TODO self.TrainModel = TrainModel

        ######################## station info ##################
        self.comingUp = False
        self.arrived = False
        self.stationDL = False
        self.stationDR = False
        self.stationName = ""
        

        ######################## fail states ###################
        self.FAILURE = False
        self.Fengine = False
        self.Fbrake = False
        self.Fsig = False
        self.passengerPanic = False #ebrake from train model

        ######################## nonvitals #####################
        self.doorsL = False
        self.doorsR = False
        self.inLights = False
        self.exLights = False
        self.announce = ""
        self.temp = 68

        ######################## vitals ########################
        self.engine = Engine(self, cmdV, currV, auth, self.IDnum)
        self.engine.cmdV = cmdV
        self.engine.setpoint_speed = 0.0
        self.engine.currV = currV
        self.engine.auth = auth
        
        self.engine.brake = False
        self.engine.EBrake = False

        ##### to and from train model
            #from software -> update speedlimit
            # brakes(both), failures, cmdV, and auth, error check if feeling fancy
            # use a check sum failure detection or find other
            #

        self.stationList =("Shadyside",
                        "Herron Ave",
                        "Swissville",
                        "Penn Station",
                        "Steel Plaza",
                        "First Ave",
                        "Station Square",
                        "South Hills Junction", 
                        "Pioneer",
                        "Edgebrook",
                        "Whited",
                        "South Bank",
                        "Central",
                        "Inglewood",
                        "Overbrook",
                        "Glenburry",
                        "Dormont",
                        "Mt Lebanon", 
                        "Poplar",
                        "Castle Shannon")
                            #need to sort which is called in fucnntions call
                            

    ##############################################################
    #########################  functions  ########################
    ##############################################################


      ######################## Brakes ########################
    def setBrake(self, brake):
        self.engine.setBrake(brake)
        #TODO
        #update LED and Train model

############################################################################################################################
############################################################################################################################

        # Engine of TC

############################################################################################################################
############################################################################################################################

class Engine():
    def __init__(
                 self,
                 TrainController,
                 cmdV = 0,
                 currV = 0,
                 auth = 0,
                 trainID = 0
                 ):

######################## Train Info #####################
        self.trainID = trainID
        self.TC = TrainController

######################## Vitals #####################
        self.AnteayerV = 0.0 # T-2
        self.prevV = 0.0     # T-1
        self.currV = currV   # T  
        self.manCmdV = 0     
        self.cmdV = cmdV
        self.auth = auth
        self.brake = False
        self.EBrake = False
        self.allowedError = 5

######################## Power Info #####################
        self.kp = 3000
        self.ki = 1000
        self.limits = (0,120000) #120kW

        self.prevPower0 = 0.0
        self.Power0 = 0.0
        self.PI0 = PID(self.kp, self.ki, 0)
        self.tooFast0 = False

        self.prevPower1 = 0.0
        self.Power1 = 0.0
        self.PI1 = PID(self.kp, self.ki, 0)
        self.tooFast1 = False

        self.prevPower2 = 0.0
        self.Power2 = 0.0
        self.PI2 = PID(self.kp, self.ki, 0)
        self.tooFast2 = False

        self.powers = {self.power0, self.power1, self.power2}


###################### update Displays ######################


    def setBrake(self, mode):
        self.brake = mode
        if (mode):
            self.TrainController.SendServiceBrakeOn()
        else:
             self.TrainController.SendServiceBrakeOff()

        self.BrakeFailureTest()

        # self.TrainController.DisplayUpdate()
        # TODO
        #update TM and LED