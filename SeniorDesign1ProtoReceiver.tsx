/**
 * IoT Environmental Sensor Node — tscircuit Board
 * ================================================
 * Board: 4-layer, 42mm x 56mm
 *
 * COMPONENT SIZE REFERENCE (for placement verification):
 *   0603 passive:      ~1.6mm x 0.8mm
 *   0805 passive:      ~2.0mm x 1.2mm
 *   SOT-23 (3-pin):    ~3.0mm x 1.4mm
 *   SOT-23-5:          ~3.0mm x 1.7mm
 *   SOIC-8:            ~5.0mm x 4.0mm
 *   Pushbutton:        ~3.5mm x 3.5mm (with housing)
 *   Stampboard (U1):   ~14mm x 12mm (8L+8R+4B at 1.27mm pitch)
 *   USB-C receptacle:  ~8.9mm x 7.3mm (custom footprint)
 *   Pinrow2 (JST):     ~5mm x 2.5mm
 *   Mounting hole:     5mm outer diameter
 *
 * LAYOUT (Y axis, top=negative, bottom=positive):
 *   Y=-25 to -20 : USB-C connector (custom footprint, top edge)
 *   Y=-18 to -15 : CC resistors
 *   Y=-14 to -10 : Charger (left), LDO (right), battery connector
 *   Y= -6 to  +6 : ESP32-C3 stampboard (center)
 *   Y= +9 to +12 : EN/BOOT passives (right), ESP decoupling (left)
 *   Y=+10 to +18 : LEDs (far left), buttons (far right)
 *   Y=+19 to +24 : SCD41 sensor + decoupling (bottom edge)
 */

export default () => (
  <board
    width="42mm"
    height="56mm"
    layers={4}
    defaultTraceWidth="0.25mm"
    minTraceWidth="0.15mm"
    autorouter="auto-cloud"
  >
    {/* ====== NETS ====== */}
    <net name="VUSB" isForPower />
    <net name="VBAT" isForPower />
    <net name="V3_3" isForPower />
    <net name="GND" isGround />
    <net name="I2C_SDA" />
    <net name="I2C_SCL" />
    <net name="LED_PWR_GPIO" />
    <net name="LED_WIFI_GPIO" />
    <net name="USB_DP" />
    <net name="USB_DM" />

    {/* ====================================================================
        1. USB-C CONNECTOR (J1) — custom footprint at top edge
        ====================================================================
        A USB-C 2.0 receptacle has pads for VBUS, GND, D+, D-, CC1, CC2.
        Physical size: ~8.94mm wide x 7.3mm deep.
        We build this from individual smtpads to get a realistic footprint.
        Placed at Y=-23, centered. The pads span roughly ±4mm in X.
    */}
    <chip
      name="J1"
      pcbX={0}
      pcbY={-23}
      pinLabels={{
        pin1: "GND1",
        pin2: "VBUS1",
        pin3: "CC1",
        pin4: "DP1",
        pin5: "DM1",
        pin6: "CC2",
        pin7: "VBUS2",
        pin8: "GND2",
      }}
      schPinArrangement={{
        leftSide: {
          direction: "top-to-bottom",
          pins: ["VBUS1", "VBUS2", "DP1", "DM1"],
        },
        rightSide: {
          direction: "top-to-bottom",
          pins: ["CC1", "CC2"],
        },
        bottomSide: {
          direction: "left-to-right",
          pins: ["GND1", "GND2"],
        },
      }}
      connections={{
        GND1: "net.GND",
        GND2: "net.GND",
        VBUS1: "net.VUSB",
        VBUS2: "net.VUSB",
        DP1: "net.USB_DP",
        DM1: "net.USB_DM",
      }}
      footprint={
        <footprint>
          {/* VBUS pads (left and right, large for current) */}
          <smtpad portHints={["2"]} pcbX="-3.25mm" pcbY="-2.5mm"
            width="0.6mm" height="1.2mm" shape="rect" />
          <smtpad portHints={["7"]} pcbX="3.25mm" pcbY="-2.5mm"
            width="0.6mm" height="1.2mm" shape="rect" />
          {/* D- pad */}
          <smtpad portHints={["5"]} pcbX="-1.75mm" pcbY="-2.5mm"
            width="0.3mm" height="1.0mm" shape="rect" />
          {/* D+ pad */}
          <smtpad portHints={["4"]} pcbX="-1.00mm" pcbY="-2.5mm"
            width="0.3mm" height="1.0mm" shape="rect" />
          {/* CC1 */}
          <smtpad portHints={["3"]} pcbX="-0.25mm" pcbY="-2.5mm"
            width="0.3mm" height="1.0mm" shape="rect" />
          {/* CC2 */}
          <smtpad portHints={["6"]} pcbX="0.25mm" pcbY="-2.5mm"
            width="0.3mm" height="1.0mm" shape="rect" />
          {/* GND / shield pads (outer edges) */}
          <smtpad portHints={["1"]} pcbX="-4.25mm" pcbY="0mm"
            width="1.0mm" height="2.5mm" shape="rect" />
          <smtpad portHints={["8"]} pcbX="4.25mm" pcbY="0mm"
            width="1.0mm" height="2.5mm" shape="rect" />
          {/* Outline silkscreen */}
          <silkscreenpath route={[
            { x: -4.5, y: -3.5 },
            { x: 4.5, y: -3.5 },
            { x: 4.5, y: 3.5 },
            { x: -4.5, y: 3.5 },
            { x: -4.5, y: -3.5 },
          ]} />
        </footprint>
      }
    />

    {/* CC pull-downs — 5.1k to GND
        Placed at Y=-18, 7mm below J1 center. 14mm apart in X. */}
    <resistor name="R_CC1" resistance="5.1k" footprint="0603"
      pcbX={-4} pcbY={-18}
      connections={{ pin1: ".J1 > .CC1", pin2: "net.GND" }}
    />
    <resistor name="R_CC2" resistance="5.1k" footprint="0603"
      pcbX={7} pcbY={-18}
      connections={{ pin1: ".J1 > .CC2", pin2: "net.GND" }}
    />

    {/* ====================================================================
        2. MCP73831 CHARGER (U2) — SOT-23-5, ~3mm x 1.7mm
        ====================================================================
        Placed at (-10, -13). Nearest neighbors:
          R_PROG at (-15, -11): 5mm away — OK
          C_CHRG_IN at (-10, -16): 3mm away — OK (0603 is tiny)
          C_CHRG_OUT at (-6, -11): 4mm away — OK
    */}
    <chip
      name="U2"
      footprint="sot23_5"
      pcbX={-10}
      pcbY={-13}
      pinLabels={{
        pin1: "STAT",
        pin2: "VSS",
        pin3: "VBAT",
        pin4: "VDD",
        pin5: "PROG",
      }}
      schPinArrangement={{
        leftSide: { direction: "top-to-bottom", pins: ["VDD", "PROG"] },
        rightSide: { direction: "top-to-bottom", pins: ["VBAT", "STAT"] },
        bottomSide: { direction: "left-to-right", pins: ["VSS"] },
      }}
      connections={{
        VDD: "net.VUSB",
        VSS: "net.GND",
        VBAT: "net.VBAT",
      }}
    />

    <resistor name="R_PROG" resistance="2k" footprint="0603"
      pcbX={-15} pcbY={-11}
      connections={{ pin1: ".U2 > .PROG", pin2: "net.GND" }}
    />
    <capacitor name="C_CHRG_IN" capacitance="1uF" footprint="0603"
      pcbX={-10} pcbY={-16}
      connections={{ pos: "net.VUSB", neg: "net.GND" }}
    />
    <capacitor name="C_CHRG_OUT" capacitance="4.7uF" footprint="0805"
      pcbX={-6} pcbY={-11}
      connections={{ pos: "net.VBAT", neg: "net.GND" }}
    />

    {/* Battery connector (J2) — pinrow2, ~5mm x 2.5mm
        Placed at (-18, -13). 8mm from U2 center — OK */}
    <chip
      name="J2"
      footprint="pinrow2"
      pcbX={-18}
      pcbY={-13}
      pinLabels={{ pin1: "VBAT_POS", pin2: "GND_J" }}
      connections={{ VBAT_POS: "net.VBAT", GND_J: "net.GND" }}
    />

    {/* ====================================================================
        3. MCP1700 LDO (U3) — SOT-23, ~3mm x 1.4mm
        ====================================================================
        Placed at (10, -13). Nearest neighbors:
          C_LDO_IN at (7, -11): 3.6mm — OK
          C_LDO_OUT at (14, -11): 4.5mm — OK
    */}
    <chip
      name="U3"
      footprint="sot23"
      pcbX={10}
      pcbY={-13}
      pinLabels={{ pin1: "GND_R", pin2: "VIN", pin3: "VOUT" }}
      schPinArrangement={{
        leftSide: { direction: "top-to-bottom", pins: ["VIN"] },
        rightSide: { direction: "top-to-bottom", pins: ["VOUT"] },
        bottomSide: { direction: "left-to-right", pins: ["GND_R"] },
      }}
      connections={{
        VIN: "net.VBAT",
        GND_R: "net.GND",
        VOUT: "net.V3_3",
      }}
    />

    <capacitor name="C_LDO_IN" capacitance="1uF" footprint="0603"
      pcbX={7} pcbY={-11}
      connections={{ pos: "net.VBAT", neg: "net.GND" }}
    />
    <capacitor name="C_LDO_OUT" capacitance="1uF" footprint="0603"
      pcbX={14} pcbY={-11}
      connections={{ pos: "net.V3_3", neg: "net.GND" }}
    />
    <capacitor name="C_BULK" capacitance="10uF" footprint="0805"
      pcbX={18} pcbY={-2}
      connections={{ pos: "net.V3_3", neg: "net.GND" }}
    />

    {/* ====================================================================
        4. ESP32-C3-MINI-1 (U1) — stampboard ~14mm x 12mm
        ====================================================================
        Centered at (0, 0). The stampboard body extends roughly:
          X: -7mm to +7mm
          Y: -6mm to +6mm
        ALL surrounding components must be outside this zone.
    */}
    <chip
      name="U1"
      footprint="stampboard_left8_right8_bottom4_top0_w14mm_p1.27mm"
      pcbX={0}
      pcbY={0}
      pinLabels={{
        pin1: "GND1",
        pin2: "GND2",
        pin3: "V3_3",
        pin4: "NC1",
        pin5: "IO2",
        pin6: "IO3",
        pin7: "NC2",
        pin8: "EN",
        pin9: "NC3",
        pin10: "NC4",
        pin11: "NC5",
        pin12: "IO4",
        pin13: "IO5",
        pin14: "IO9",
        pin15: "IO18",
        pin16: "IO19",
        pin17: "GND3",
        pin18: "NC6",
        pin19: "NC7",
        pin20: "GND4",
      }}
      schPinArrangement={{
        leftSide: {
          direction: "top-to-bottom",
          pins: ["V3_3", "EN", "IO2", "IO3", "IO4", "IO5"],
        },
        rightSide: {
          direction: "top-to-bottom",
          pins: ["IO9", "IO18", "IO19"],
        },
        bottomSide: {
          direction: "left-to-right",
          pins: ["GND1", "GND2", "GND3", "GND4"],
        },
      }}
      connections={{
        V3_3: "net.V3_3",
        GND1: "net.GND",
        GND2: "net.GND",
        GND3: "net.GND",
        GND4: "net.GND",
        IO2: "net.I2C_SDA",
        IO3: "net.I2C_SCL",
        IO4: "net.LED_PWR_GPIO",
        IO5: "net.LED_WIFI_GPIO",
        IO18: "net.USB_DM",
        IO19: "net.USB_DP",
      }}
      schPinSpacing={0.75}
    />

    {/* ESP32 supporting passives — all placed OUTSIDE the ±7mm x ±6mm zone
        R_EN at (12, -7): right side, above midline — 5mm from stampboard edge
        C_EN at (16, -7): further right — clear
        R_BOOT at (12, 8): right side, below midline — 2mm from stampboard edge
        C_ESP_DEC at (-12, -7): left side — 5mm from stampboard edge */}
    <resistor name="R_EN" resistance="10k" footprint="0603"
      pcbX={12} pcbY={-5}
      connections={{ pin1: "net.V3_3", pin2: ".U1 > .EN" }}
    />
    <capacitor name="C_EN" capacitance="1uF" footprint="0603"
      pcbX={16} pcbY={-5}
      connections={{ pos: ".U1 > .EN", neg: "net.GND" }}
    />
    <resistor name="R_BOOT" resistance="10k" footprint="0603"
      pcbX={12} pcbY={8}
      connections={{ pin1: "net.V3_3", pin2: ".U1 > .IO9" }}
    />
    <capacitor name="C_ESP_DEC" capacitance="100nF" footprint="0603"
      pcbX={-12} pcbY={-5}
      connections={{ pos: "net.V3_3", neg: "net.GND" }}
    />

    {/* ====================================================================
        5. SCD41 CO2 SENSOR (U4) — SOIC-8 stand-in, ~5mm x 4mm
        ====================================================================
        Placed at (0, 20). Well below ESP32 zone (+6mm edge + 14mm gap).
    */}
    <chip
      name="U4"
      footprint="soic8"
      pcbX={0}
      pcbY={20}
      pinLabels={{
        pin1: "VDD",
        pin2: "GND_S1",
        pin3: "SDA",
        pin4: "SCL",
        pin5: "NC1",
        pin6: "NC2",
        pin7: "NC3",
        pin8: "GND_S2",
      }}
      schPinArrangement={{
        leftSide: { direction: "top-to-bottom", pins: ["VDD", "SDA", "SCL"] },
        bottomSide: { direction: "left-to-right", pins: ["GND_S1", "GND_S2"] },
      }}
      connections={{
        VDD: "net.V3_3",
        GND_S1: "net.GND",
        GND_S2: "net.GND",
        SDA: "net.I2C_SDA",
        SCL: "net.I2C_SCL",
      }}
      schPinSpacing={0.75}
    />

    {/* I2C pull-ups at Y=14 — between ESP32 (edge at +6) and SCD41 (at +20) */}
    <resistor name="R_SDA" resistance="10k" footprint="0603"
      pcbX={-5} pcbY={14}
      connections={{ pin1: "net.V3_3", pin2: "net.I2C_SDA" }}
    />
    <resistor name="R_SCL" resistance="10k" footprint="0603"
      pcbX={5} pcbY={14}
      connections={{ pin1: "net.V3_3", pin2: "net.I2C_SCL" }}
    />

    {/* SCD41 decoupling at Y=24 — 4mm below U4 center */}
    <capacitor name="C_SCD_100N" capacitance="100nF" footprint="0603"
      pcbX={-5} pcbY={24}
      connections={{ pos: "net.V3_3", neg: "net.GND" }}
    />
    <capacitor name="C_SCD_10U" capacitance="10uF" footprint="0805"
      pcbX={5} pcbY={24}
      connections={{ pos: "net.V3_3", neg: "net.GND" }}
    />

    {/* ====================================================================
        6. LEDs — far left at X=-16, well outside ESP32 zone (edge at -7)
        ====================================================================
        Vertical spacing: 3mm between each resistor-LED pair, 3mm between pairs.
    */}
    <resistor name="R_LED1" resistance="10k" footprint="0603"
      pcbX={-16} pcbY={9}
      connections={{ pin1: "net.LED_PWR_GPIO", pin2: ".D1 > .pos" }}
    />
    <led name="D1" color="red" footprint="0603"
      pcbX={-16} pcbY={12}
      connections={{ neg: "net.GND" }}
    />

    <resistor name="R_LED2" resistance="10k" footprint="0603"
      pcbX={-16} pcbY={15}
      connections={{ pin1: "net.LED_WIFI_GPIO", pin2: ".D2 > .pos" }}
    />
    <led name="D2" color="green" footprint="0603"
      pcbX={-16} pcbY={18}
      connections={{ neg: "net.GND" }}
    />

    {/* ====================================================================
        7. BUTTONS — far right at X=16, 10mm apart vertically
        ====================================================================
        Pushbutton body is ~3.5mm. At 10mm spacing they have 6.5mm gap.
        Both well outside ESP32 zone (right edge at +7, buttons at +16).
    */}
    <chip
      name="SW_BOOT"
      footprint="pushbutton_id1.3mm_od2mm"
      pcbX={16}
      pcbY={9}
      pinLabels={{ pin1: "A", pin2: "B" }}
      connections={{ A: ".U1 > .IO9", B: "net.GND" }}
    />
    <chip
      name="SW_RST"
      footprint="pushbutton_id1.3mm_od2mm"
      pcbX={16}
      pcbY={16}
      pinLabels={{ pin1: "A", pin2: "B" }}
      connections={{ A: ".U1 > .EN", B: "net.GND" }}
    />

    {/* ====================================================================
        8. MOUNTING HOLES — M2.5, grounded, inset 3mm from board edges
        ====================================================================
        Board is 42mm x 56mm, so edges are at ±21mm X, ±28mm Y.
        Holes at ±18mm X, ±25mm Y (3mm inset).
    */}
    <chip name="MH1" pcbX={-18} pcbY={-25}
      pinLabels={{ pin1: "PAD" }}
      connections={{ PAD: "net.GND" }}
      footprint={
        <footprint>
          <platedhole portHints={["1"]} pcbX="0mm" pcbY="0mm"
            outerDiameter="5mm" holeDiameter="2.7mm" shape="circle" />
        </footprint>
      }
    />
    <chip name="MH2" pcbX={18} pcbY={-25}
      pinLabels={{ pin1: "PAD" }}
      connections={{ PAD: "net.GND" }}
      footprint={
        <footprint>
          <platedhole portHints={["1"]} pcbX="0mm" pcbY="0mm"
            outerDiameter="5mm" holeDiameter="2.7mm" shape="circle" />
        </footprint>
      }
    />
    <chip name="MH3" pcbX={-18} pcbY={25}
      pinLabels={{ pin1: "PAD" }}
      connections={{ PAD: "net.GND" }}
      footprint={
        <footprint>
          <platedhole portHints={["1"]} pcbX="0mm" pcbY="0mm"
            outerDiameter="5mm" holeDiameter="2.7mm" shape="circle" />
        </footprint>
      }
    />
    <chip name="MH4" pcbX={18} pcbY={25}
      pinLabels={{ pin1: "PAD" }}
      connections={{ PAD: "net.GND" }}
      footprint={
        <footprint>
          <platedhole portHints={["1"]} pcbX="0mm" pcbY="0mm"
            outerDiameter="5mm" holeDiameter="2.7mm" shape="circle" />
        </footprint>
      }
    />

    {/* Silkscreen */}
    <fabricationnotetext text="IoT Sensor Node v1.0"
      anchorAlignment="bottom_left" fontSize="1mm"
      pcbX={-19} pcbY={-27}
    />
    <fabricationnotetext text="Unit #____"
      anchorAlignment="bottom_right" fontSize="1mm"
      pcbX={19} pcbY={-27}
    />
  </board>
)