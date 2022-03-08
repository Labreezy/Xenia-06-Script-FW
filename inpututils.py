import struct, math

BTNS = {"NONE": 0,
    "KEY_DUP": 0x0001,
"KEY_DDOWN": 0x0002,
"KEY_DLEFT": 0x0004,
"KEY_DRIGHT": 0x0008,
"KEY_PLUS": 0x0010,
#"KEY_BACK": 0x0020,
#"LEFT_THUMB": 0x0040,
#"RIGHT_THUMB": 0x0080,
"KEY_L": 0x0100,
"KEY_R": 0x0200,
"KEY_A": 0x1000,
"KEY_B": 0x2000,
"KEY_X": 0x4000,
"KEY_Y": 0x8000}
AXIS_MIN = -32767 #switch compatability, actually -32768
AXIS_MAX = 32767
GAMEPAD_FMT = ">H2B4h"
GAMEPAD_STRUCT_SZ = struct.calcsize(GAMEPAD_FMT)
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
            "RX":  struct.pack(">h",self.RX)[0],
            "RY":  struct.pack(">h",self.RY)[0],
            'LT': self.LT,
            'RT': self.RT
        }
    def dict_from_bytes(self, bs):
        self.buttons,self.LT,self.RT,self.LX,self.LY,self.RX,self.RY = struct.unpack(GAMEPAD_FMT, bs)
        return self.to_dict()

def bin2txt(fn):
    scriptsz = GAMEPAD_STRUCT_SZ
    with open(fn, "rb") as inputf:
        inputf.seek(0,2)
        fsize = inputf.tell()
        inputf.seek(0)
        if fsize % GAMEPAD_STRUCT_SZ != 0:
            print(f"Uneven filesize {fsize}")
            return
        outputfn = fn + ".txt"
        with open(outputfn, "w") as outf:
            line_n = 0
            while inputf.tell() < fsize:
                in_bytes = inputf.read(scriptsz)
                buttons, lt, rt, lx, ly, rx, ry = struct.unpack(GAMEPAD_FMT, in_bytes)

                btn_slist = []
                if buttons == 0 and lt == 0 and rt == 0:
                    btn_string = "NONE"
                else:

                    for name, mask in BTNS.items():
                        if buttons & mask == mask and mask != 0:
                            btn_slist.append(name)

                    if lt > 0:
                        btn_slist.append("KEY_L")
                    if rt > 0:
                        btn_slist.append("KEY_R")
                    btn_string = ";".join(btn_slist)


                stick_string = f'{lx};{ly} {rx};{ry}'
                line = f'{line_n} {btn_string} {stick_string}\n'
                outf.write(line)
                line_n += 1



if __name__ == "__main__":
    bin2txt("rec2.bin")