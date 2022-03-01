import struct, math

BTNS = {"NONE": 0,
    "DPAD_UP": 0x0001,
"DPAD_DOWN": 0x0002,
"DPAD_LEFT": 0x0004,
"DPAD_RIGHT": 0x0008,
"KEY_START": 0x0010,
"KEY_BACK": 0x0020,
"LEFT_THUMB": 0x0040,
"RIGHT_THUMB": 0x0080,
"LEFT_SHOULDER": 0x0100,
"RIGHT_SHOULDER": 0x0200,
"KEY_A": 0x1000,
"KEY_B": 0x2000,
"KEY_X": 0x4000,
"KEY_Y": 0x8000}
AXIS_MIN = -32768
AXIS_MAX = 32767
GAMEPAD_FMT = ">H2B4h"

class XInputGamepadStruct():
    def __init__(self):
        self.buttons = 0
        self.LT = 0
        self.RT = 0
        self.LX = 0
        self.LY = 0
        self.RX = 0
        self.RY = 0
    def to_bytes(self):
        return struct.pack(GAMEPAD_FMT, self.buttons,self.LT,self.RT,self.LX,self.LY,self.RX,self.RY)
    def to_dict(self):
        return {
            "buttons": struct.pack(">H",self.buttons)[0],
            "LX":  struct.pack(">h",self.LX)[0],
            "LY":  struct.pack(">h",self.LY)[0],
            "RX": self.RX,
            "RY": self.RY
        }