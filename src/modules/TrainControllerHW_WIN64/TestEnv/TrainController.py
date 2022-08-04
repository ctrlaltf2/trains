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


    ######################## speed controls ######################  
    #todo
    def setV(self, currV):
        self.engine.PILoop()

        self.engine.AnteayerV = self.engine.prevV
        self.engine.prevV = self.engine.currV
        self.engine.currV = currV
        
        #  TODO 
        # self.engine.DetectEngineFailure(currV)
        # self.engine.DetectBrakeFailure()

        self.stationHanfler()



    def stationHandler(self):
        #stopped at new station
        if(self.comingUp and self.engine.currV == 0):

            # if train arrived at station
            if(self.engine.auth == 0):
                self.atStation = True

                # Opening Left Doors in auto mode
                if(self.stationDR and self.auto):
                    if(self.doorsR):
                         pass
                    else:
                        self.doorsR = True
                        # TODO 
                        # set lights 
                        #update TM
                        

                #Opening Right Doors in auto mode
                if(self.stationDL and self.auto):
                    if(self.doorsL):
                         pass
                    else:
                       self.doorsR = True
                        # TODO 
                        # set lights 
                        #update TM

            #when departing
            self.comingUp = False       #reset flag
            if(self.engine.auth != 0):
                self.SetBrake(False)    #turn off brakes

    def setCmdV(self, cmdV):
        self.engine.cmdV = cmdV
        #updateOLED


    def setAuth(self, auth):
        if(auth == 0):
            self.setBrakes(True)
            # TODO send to TM and update displays 
            print("Brakes: ON, Stop upcoming")
    
        self.engine.auth = auth

    
    def setSetptV(self, setPtV):
        self.engine.setPtV = setPtV


    def setKp(self, kp):
        self.engine.kp = kp
        #TODO
        #update LED and Train model


    def setKi(self,ki):
        self.engine.ki = ki
        #TODO
        #update LED and Train model

   ######################## Brakes ########################
    def setBrake(self, brake):
        self.engine.setBrake(brake)
        #TODO
        #update LED and Train model
   
    def setEBrake(self, Ebrake):
        self.engine.EBrake = Ebrake
        #TODO
        #update LED and Train model


    ######################### nonvitals ########################
    def toggleAuto(self, togguy):
        self.auto = togguy
        #update LEDs (and trian model?)
        # TODO

    def togDoorsL(self, boolman):
        self.left_doors = boolman
        #update LEDs and train model
        # if(self.left_doors):
        #     self.TrainModel.open_left_doors()
        # else:
        #     self.TrainModel.close_left_doors()
           
    def togDoorsR(self, boolman):
        self.right_doors = boolman
        #update LEDs and train model
        # if(self.right_doors):
        #     self.TrainModel.open_right_doors()
        # else:
        #     self.TrainModel.close_right_doors()
    
    #toggle_interior_lights: function for toggling interior lights based of checkmarks
    def togInLights(self):
        self.interior_lights = not(self.inLights)
        print("Interior Lights: " + str(self.inLights))

        #UPDATE LED and trian model
        # if(self.inLights):
        #     self.TrainModel.TURN in LIGHTS ON()
        # else:
        #     self.TrainModel.TURN in LIGHTS OFF()


    def togExLights(self):
        self.exterior_lights = not(self.exterior_lights)
        print("Exterior Lights: " + str(self.exterior_lights))
        if(self.exterior_lights):
            self.TrainModel.t_lights_on()
        else:
            self.TrainModel.t_lights_off()

    def ExLightsON(self):
        self.exLights = True
        #update lights and train model
        #self.TrainModel.t_lights_on()
        #self.HandleExteriorLights()

    def ExLightsOFF(self):
        self.exLights = False
        #update lights and trian model
        #self.TrainModel.t_lights_off()
        #self.HandleExteriorLights()

        
    def on_TempChange(self):
        #self.temp = poll from UI input
        #update TM and LEDs
        pass


    def BuildAnnouncement(self):
        if(self.upcomingStation):
            self.announce = str("Arriving at " + self.station + " Station.")

        if(self.doorsL and self.doorsR):
                self.announce += " The doors will open on the left and right.\n"
        elif(self.doorsL):
            self.announce += " The doors will open on the left.\n"
        elif(self.doorsR):
                self.announce += " The doors will open on the right.\n"
        else:
            self.announce += ""

    #SendAnnouncement: used to send announcement to train model and UI  
    def SendAnnouncement(self):
        #self.TrainModel.set_announcements(self.announce)
        #send to OLED 
        #todo
        pass

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
        self.setptV = 0.0
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

    def checkPriorConditions(self):

        # when in auto 
        if (self.TC.auto):
            # leaving from a stop
            if (self.TC.atStation and not (self.cmdV == 0 or self.auth == 0)):
                self.TC.togDoorsL(False)
                self.TC.togDoorsR(False)
                self.turnBrakeOff()
                self.TC.atStation = False
                print("Brake: OFF")

            
            #  recovered from too fast
            if (self.tooFast0 and not(self.auth == 0) and (self.currV < self.cmdV)):
                self.turnBrakeOff()
                self.tooFast0 = False
                print("Brake: OFF")

            # setting too fast
            if (self.currV > (self.cmdV + self.AllowedError)):
                print("Brake: ON")
                self.tooFast0 = True
                self.PILoop(0,0)
                self.turnBakeOn()

            # normal auto use case, use commanded V
            elif (not(self.brake or self.EBrake)):
                self.prevPower = self.power
                self.PILoop(self.cmdV, self.currV)

            # fail
            else:
                self.PILoop(0,0)
        
        # in manual, use manual Commanded V
        else:
            if (not (self.manCmdV == 0 or self.brake or self.EBrake)):
                self.PILoop(self.manCmdV, self.currV)

            ##update dispalays TODO 



    def PILoop(self, setguy, inguy):
        self.PI0.setpoint = setguy
        self.power0 = self.PI0(inguy, dt = 1) #timetep set to 1

        self.PI1.setpoint = setguy
        self.power1 = self.PI1(inguy, dt = 1) 

        self.PI2.setpoint = setguy
        self.power2 = self.PI2(inguy, dt = 1)


         #error check with timeout
        counter = 0 
        while True:
            if (max(self.powers) - min(self.powers) > self.allowedError and counter < 3):

                print("Error: Invalid Power Calculation")
                print("Trying again")
                # send a null power command in hopes it stabilizes
                self.PILoop(setguy, 0)
                self.checkPriorConditions()
                counter += 1
            # if couunter exceeds 3 tries it begins an error alert
            elif (counter > 3):
                pass
                #TODO begin error alert
            # if counter < 3 and range < allowedError continue
            else:
                break

        
    def getPower(self):
        return self.power0


                            ## TODO

                            # abstract message sending and decoding
                            # set up better main loop
                            # test and get working PID reliably
                            # make most gpio set up
                            # merge these 2. finish completing them
                            # set up full test class

   ###################### ON CLICK/CALL ACTIONS ACTIONS ######################

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
        
    def OnEBrakeOn(self):
        self.emergency_brake = True
        self.TrainController.SendEmergencyBrakeOn()
        self.TrainController.DisplayUpdate()

    def IncreaseSetpoint(self):
        if(self.setPtV +1 <= self.commanded_speed):
            self.setpoint_speed = self.setpoint_speed + 1
        self.TrainController.DisplayUpdate()

    def DecreaseSetpoint(self):
        if(self.setpoint_speed > 0):
            self.setpoint_speed = self.setpoint_speed - 1
        self.TrainController.DisplayUpdate()

    ###################### FAILURE DETECTION ######################
    def DetectEngineFailure(self, current):
        if(current == 666):
            self.engine_failure = True
            self.TrainController.UI.ui.textBrowser_13.setStyleSheet(u"background-color: rgb(255, 0, 0);")
            self.VitalFault()
            self.TrainController.TrainModel.train_detected_engine_failure()

    def DetectBrakeFailure(self):
        if(self.service_brake and (self.current_speed >= (self.previous_speed+.5)) and not(self.current_speed == 0)):
            self.brake_failure = True
            self.TrainController.UI.ui.textBrowser_14.setStyleSheet(u"background-color: rgb(255, 0, 0);")
            self.VitalFault()
            self.TrainController.TrainModel.train_detected_brake_failure()

            print("Service brake: " + str(self.service_brake))
            print("Current Speed: " + str(self.current_speed))
            print("Previous speed: " + str(self.previous_speed))


    #testing brake failure
    def BrakeFailureTest(self):
        if(self.TrainController.TrainModel.train.brakeFailure):
            self.brake_failure = True
            self.TrainController.UI.ui.textBrowser_14.setStyleSheet(u"background-color: rgb(255, 0, 0);")
            self.VitalFault()
            self.TrainController.TrainModel.train_detected_brake_failure()
           # print("Service brake: " + str(self.service_brake))
           # print("Current Speed: " + str(self.current_speed))
           # print("Previous speed: " + str(self.previous_speed))
    
    def VitalFault(self):
        self.TC.any_failure = True
        print("##*!!!!!!*## VITAL FAULT DETECTED ##*!!!!!!*##")
        if(not(self.TrainController.passenger_brake_detected)):
            self.OnEBrakeOn()

