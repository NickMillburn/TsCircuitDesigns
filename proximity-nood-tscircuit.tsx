/**
 * BLE Proximity NOOD Wearable — tscircuit PCB Design
 *
 * This file defines the complete circuit for a proximity-triggered
 * LED wearable. Each person wears one identical unit. When two units
 * come within BLE range, the pink NOOD LED filament glows brighter
 * the closer they are.
 *
 * Signal chain:
 *   USB-C (5V) → MCP73831 (charger) → LiPo (3.7V) → AP2112K (LDO) → 3.3V
 *   ESP32-S3 scans BLE → RSSI → PWM on GPIO7 → TPS61169 CTRL → NOOD glows
 *
 * To use:
 *   1. npm install -g tscircuit
 *   2. tsci init (in a new directory)
 *   3. Replace index.tsx with this file
 *   4. tsci dev (opens browser preview at localhost:3020)
 *   5. Export Gerbers for manufacturing
 */

import { sel, type ChipProps } from "tscircuit"

// =============================================================================
// Sub-component: ESP32-S3-WROOM-1-N8R8 module
// =============================================================================
// The WROOM-1 is a 38-pin module (25.5×18mm) with built-in PCB antenna.
// We define only the pins we actually use to keep things clean.
// Full pinout: https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_datasheet_en.pdf

const esp32PinLabels = {
  pin1: "GND1",
  pin2: "VDD",
  pin3: "EN",
  pin11: "GPIO7",    // PWM output to TPS61169 CTRL
  pin13: "GPIO19",   // USB D-
  pin14: "GPIO20",   // USB D+
  pin27: "GPIO0",    // Boot mode select (pull high for normal boot)
  pin39: "GND39",
  pin40: "GND40",
  pin41: "GND41",
} as const

const ESP32S3Module = (props: ChipProps<typeof esp32PinLabels>) => (
  <chip
    footprint="stamped_module_38pin_25.5x18mm"
    pinLabels={esp32PinLabels}
    manufacturerPartNumber="ESP32-S3-WROOM-1-N8R8"
    supplierPartNumbers={{ jlcpcb: ["C2913201"] }}
    schPinArrangement={{
      leftSide: {
        direction: "top-to-bottom",
        pins: ["VDD", "EN", "GPIO0", "GND1"],
      },
      rightSide: {
        direction: "top-to-bottom",
        pins: ["GPIO7", "GPIO19", "GPIO20", "GND39"],
      },
    }}
    internallyConnectedPins={[["GND1", "GND39", "GND40", "GND41"]]}
    {...props}
  />
)

// =============================================================================
// Sub-component: TPS61169 Constant-Current Boost Converter
// =============================================================================
// SC-70-5 package (2.0×1.25mm). Boosts 3.3V to ~12V to drive the NOOD.
// Pin 1: SW (switch node — connects to inductor)
// Pin 2: GND
// Pin 3: FB (feedback — current sense resistor goes here)
// Pin 4: CTRL (PWM dimming input from ESP32)
// Pin 5: VIN (3.3V supply)

const tps61169PinLabels = {
  pin1: "SW",
  pin2: "GND",
  pin3: "FB",
  pin4: "CTRL",
  pin5: "VIN",
} as const

const TPS61169 = (props: ChipProps<typeof tps61169PinLabels>) => (
  <chip
    footprint="sc70_5"
    pinLabels={tps61169PinLabels}
    manufacturerPartNumber="TPS61169DCKR"
    supplierPartNumbers={{ jlcpcb: ["C145498"] }}
    schPinArrangement={{
      leftSide: {
        direction: "top-to-bottom",
        pins: ["VIN", "SW", "GND"],
      },
      rightSide: {
        direction: "top-to-bottom",
        pins: ["CTRL", "FB"],
      },
    }}
    {...props}
  />
)

// =============================================================================
// Sub-component: MCP73831 LiPo Charger
// =============================================================================
// SOT-23-5 package. Single-cell LiPo CC/CV charger.
// Pin 1: STAT (charge status output — optional LED)
// Pin 2: VSS (ground)
// Pin 3: VBAT (battery positive — also LDO input)
// Pin 4: VDD (USB 5V in)
// Pin 5: PROG (programming resistor sets charge current)

const mcp73831PinLabels = {
  pin1: "STAT",
  pin2: "VSS",
  pin3: "VBAT",
  pin4: "VDD",
  pin5: "PROG",
} as const

const MCP73831 = (props: ChipProps<typeof mcp73831PinLabels>) => (
  <chip
    footprint="sot23_5"
    pinLabels={mcp73831PinLabels}
    manufacturerPartNumber="MCP73831T-2ACI/OT"
    supplierPartNumbers={{ jlcpcb: ["C424093"] }}
    schPinArrangement={{
      leftSide: {
        direction: "top-to-bottom",
        pins: ["VDD", "PROG", "VSS"],
      },
      rightSide: {
        direction: "top-to-bottom",
        pins: ["VBAT", "STAT"],
      },
    }}
    {...props}
  />
)

// =============================================================================
// Sub-component: AP2112K-3.3 LDO Voltage Regulator
// =============================================================================
// SOT-23-5 package. Converts battery voltage (3.0-4.2V) to stable 3.3V.
// Pin 1: VIN
// Pin 2: GND
// Pin 3: EN (enable — tie to VIN for always-on)
// Pin 4: NC (no connect)
// Pin 5: VOUT (3.3V regulated output)

const ap2112PinLabels = {
  pin1: "VIN",
  pin2: "GND",
  pin3: "EN",
  pin4: "NC",
  pin5: "VOUT",
} as const

const AP2112K = (props: ChipProps<typeof ap2112PinLabels>) => (
  <chip
    footprint="sot23_5"
    pinLabels={ap2112PinLabels}
    manufacturerPartNumber="AP2112K-3.3TRG1"
    supplierPartNumbers={{ jlcpcb: ["C51118"] }}
    schPinArrangement={{
      leftSide: {
        direction: "top-to-bottom",
        pins: ["VIN", "EN", "GND"],
      },
      rightSide: {
        direction: "top-to-bottom",
        pins: ["VOUT", "NC"],
      },
    }}
    {...props}
  />
)

// =============================================================================
// Sub-component: USB-C Connector (USB 2.0, power + data)
// =============================================================================
// We use a common 16-pin mid-mount USB-C receptacle.
// Only USB 2.0 pins are wired: VBUS, GND, D+, D-, CC1, CC2.

const usbcPinLabels = {
  pin1: "GND1",
  pin2: "VBUS1",
  pin3: "CC1",
  pin4: "DN",       // USB D-
  pin5: "DP",       // USB D+
  pin6: "SBU1",
  pin7: "VBUS2",
  pin8: "GND2",
  pin9: "GND3",
  pin10: "VBUS3",
  pin11: "CC2",
  pin12: "DN2",
  pin13: "DP2",
  pin14: "SBU2",
  pin15: "VBUS4",
  pin16: "GND4",
} as const

const USBC = (props: ChipProps<typeof usbcPinLabels>) => (
  <chip
    footprint="usb_c_16pin_mid_mount"
    pinLabels={usbcPinLabels}
    internallyConnectedPins={[
      ["GND1", "GND2", "GND3", "GND4"],
      ["VBUS1", "VBUS2", "VBUS3", "VBUS4"],
      ["DN", "DN2"],
      ["DP", "DP2"],
    ]}
    schPinArrangement={{
      leftSide: {
        direction: "top-to-bottom",
        pins: ["VBUS1", "DP", "DN", "CC1", "CC2", "GND1"],
      },
    }}
    {...props}
  />
)

// =============================================================================
// Main Board — Proximity NOOD Wearable
// =============================================================================
// Board dimensions: 28mm × 22mm (slightly larger than a quarter)
// 2-layer PCB with ground pour on bottom layer.
//
// Layout strategy:
//   - ESP32 module at top, antenna extending to board edge
//   - USB-C connector at bottom edge
//   - TPS61169 boost cluster on the right (tight switching loop)
//   - Charger + LDO on the left
//   - Battery pads on bottom layer
//   - LED output pads on right edge

export default () => {
  return (
    <board width="28mm" height="22mm" defaultTraceWidth="0.2mm">

      {/* ============================================================
          USB-C Connector — bottom center of the board
          Provides 5V power for charging and USB data for programming.
          ============================================================ */}
      <USBC name="J1" pcbX={0} pcbY={-8} />

      {/* CC1 and CC2 pull-down resistors (5.1kΩ each).
          Required by USB-C spec to identify as a USB device
          and request 5V from the host. Without these, no power. */}
      <resistor
        name="R_CC1"
        resistance="5.1k"
        footprint="0402"
        pcbX={-4}
        pcbY={-5}
      />
      <resistor
        name="R_CC2"
        resistance="5.1k"
        footprint="0402"
        pcbX={4}
        pcbY={-5}
      />
      <trace from=".J1 > .CC1" to=".R_CC1 > .pin1" />
      <trace from=".R_CC1 > .pin2" to="net.GND" />
      <trace from=".J1 > .CC2" to=".R_CC2 > .pin1" />
      <trace from=".R_CC2 > .pin2" to="net.GND" />

      {/* USB-C power and ground to nets */}
      <trace from=".J1 > .VBUS1" to="net.VBUS" />
      <trace from=".J1 > .GND1" to="net.GND" />

      {/* ============================================================
          MCP73831 LiPo Charger — bottom left
          Takes 5V from USB, charges the LiPo at 300mA (set by R_PROG).
          Outputs battery voltage on VBAT net.
          ============================================================ */}
      <MCP73831 name="U3" pcbX={-8} pcbY={-3} />

      {/* RPROG = 1000V / I_charge. For 300mA: 1000/0.3 = 3.3kΩ
          This tells the MCP73831 to charge at 300mA — safe 1C rate
          for a 300mAh battery. */}
      <resistor
        name="R_PROG"
        resistance="3.3k"
        footprint="0402"
        pcbX={-10}
        pcbY={-1}
      />

      {/* Input bypass cap on charger VDD (USB 5V side) */}
      <capacitor
        name="C_CHG_IN"
        capacitance="4.7uF"
        footprint="0402"
        pcbX={-10}
        pcbY={-5}
      />

      {/* Output bypass cap on charger VBAT (battery side) */}
      <capacitor
        name="C_CHG_OUT"
        capacitance="4.7uF"
        footprint="0402"
        pcbX={-6}
        pcbY={-1}
      />

      {/* Charger wiring */}
      <trace from=".U3 > .VDD" to="net.VBUS" />
      <trace from=".U3 > .VSS" to="net.GND" />
      <trace from=".U3 > .VBAT" to="net.VBAT" />
      <trace from=".U3 > .PROG" to=".R_PROG > .pin1" />
      <trace from=".R_PROG > .pin2" to="net.GND" />
      <trace from=".C_CHG_IN > .pin1" to="net.VBUS" />
      <trace from=".C_CHG_IN > .pin2" to="net.GND" />
      <trace from=".C_CHG_OUT > .pin1" to="net.VBAT" />
      <trace from=".C_CHG_OUT > .pin2" to="net.GND" />

      {/* ============================================================
          AP2112K LDO — center left
          Converts battery voltage (3.0-4.2V) to stable 3.3V for
          the ESP32 and TPS61169. Max 600mA output.
          ============================================================ */}
      <AP2112K name="U4" pcbX={-8} pcbY={3} />

      {/* LDO input cap (on VBAT side) */}
      <capacitor
        name="C_LDO_IN"
        capacitance="1uF"
        footprint="0402"
        pcbX={-10}
        pcbY={5}
      />

      {/* LDO output cap (on 3.3V side) — critical for LDO stability */}
      <capacitor
        name="C_LDO_OUT"
        capacitance="1uF"
        footprint="0402"
        pcbX={-6}
        pcbY={5}
      />

      {/* LDO wiring */}
      <trace from=".U4 > .VIN" to="net.VBAT" />
      <trace from=".U4 > .EN" to="net.VBAT" />    {/* Always enabled */}
      <trace from=".U4 > .GND" to="net.GND" />
      <trace from=".U4 > .VOUT" to="net.V3_3" />
      <trace from=".C_LDO_IN > .pin1" to="net.VBAT" />
      <trace from=".C_LDO_IN > .pin2" to="net.GND" />
      <trace from=".C_LDO_OUT > .pin1" to="net.V3_3" />
      <trace from=".C_LDO_OUT > .pin2" to="net.GND" />

      {/* ============================================================
          ESP32-S3-WROOM-1 Module — top center
          Positioned so the antenna end is at the top board edge.
          This is the brain: scans BLE, reads RSSI, outputs PWM.
          ============================================================ */}
      <ESP32S3Module name="U1" pcbX={0} pcbY={5} />

      {/* ESP32 power decoupling: 10μF bulk + 0.1μF high-frequency.
          These must be physically close to the VDD pin.
          The bulk cap handles low-frequency current demand spikes.
          The 100nF cap filters high-frequency switching noise. */}
      <capacitor
        name="C_ESP_BULK"
        capacitance="10uF"
        footprint="0603"
        pcbX={-3}
        pcbY={2}
      />
      <capacitor
        name="C_ESP_HF"
        capacitance="100nF"
        footprint="0402"
        pcbX={-1}
        pcbY={2}
      />

      {/* EN pin pull-up (10kΩ) + RC delay cap (100nF).
          The pull-up keeps the chip enabled. The cap creates a
          brief delay on power-up to ensure a clean reset. */}
      <resistor
        name="R_EN"
        resistance="10k"
        footprint="0402"
        pcbX={-4}
        pcbY={7}
      />
      <capacitor
        name="C_EN"
        capacitance="100nF"
        footprint="0402"
        pcbX={-4}
        pcbY={9}
      />

      {/* GPIO0 pull-up (10kΩ).
          HIGH = normal boot from flash.
          Pull LOW during reset = enter USB bootloader for flashing. */}
      <resistor
        name="R_BOOT"
        resistance="10k"
        footprint="0402"
        pcbX={-2}
        pcbY={9}
      />

      {/* ESP32 wiring */}
      <trace from=".U1 > .VDD" to="net.V3_3" />
      <trace from=".U1 > .GND1" to="net.GND" />
      <trace from=".C_ESP_BULK > .pin1" to="net.V3_3" />
      <trace from=".C_ESP_BULK > .pin2" to="net.GND" />
      <trace from=".C_ESP_HF > .pin1" to="net.V3_3" />
      <trace from=".C_ESP_HF > .pin2" to="net.GND" />

      {/* EN circuit: V3_3 → R_EN → EN pin, and EN pin → C_EN → GND */}
      <trace from=".R_EN > .pin1" to="net.V3_3" />
      <trace from=".R_EN > .pin2" to=".U1 > .EN" />
      <trace from=".C_EN > .pin1" to=".U1 > .EN" />
      <trace from=".C_EN > .pin2" to="net.GND" />

      {/* BOOT resistor: V3_3 → R_BOOT → GPIO0 */}
      <trace from=".R_BOOT > .pin1" to="net.V3_3" />
      <trace from=".R_BOOT > .pin2" to=".U1 > .GPIO0" />

      {/* USB data lines: ESP32 native USB → USB-C connector */}
      <trace from=".U1 > .GPIO19" to=".J1 > .DN" />
      <trace from=".U1 > .GPIO20" to=".J1 > .DP" />

      {/* ============================================================
          TPS61169 Boost Converter — right side
          Constant-current driver. Boosts 3.3V → ~12V to drive NOOD.

          The key design here: RSET (R_SENSE) sets the LED current.
          Formula: I_LED = 0.204V / RSET
          For ~100mA: RSET = 0.204 / 0.1 = 2.04Ω → use 2.0Ω standard

          The CTRL pin accepts PWM from the ESP32 to dim the LED.
          When the partner is nearby, PWM duty cycle increases,
          and the NOOD glows brighter.
          ============================================================ */}
      <TPS61169 name="U2" pcbX={9} pcbY={3} />

      {/* Boost inductor: 10μH, ≥1.5A saturation current.
          The inductor stores energy during each switching cycle.
          When the internal MOSFET turns off, the inductor's
          collapsing field pushes current through the Schottky diode
          to the output at a higher voltage. This is how boost
          conversion works — magnetic energy storage and release. */}
      <chip
        name="L1"
        footprint="0805"
        pcbX={11}
        pcbY={1}
        pinLabels={{ pin1: "pin1", pin2: "pin2" }}
        manufacturerPartNumber="LQH32CN100K23L"
        schPinArrangement={{
          leftSide: { direction: "top-to-bottom", pins: ["pin1"] },
          rightSide: { direction: "top-to-bottom", pins: ["pin2"] },
        }}
      />

      {/* Schottky diode: NSR0240, 40V reverse voltage.
          Only conducts when the switch MOSFET is off, passing
          the boosted current to the output cap and LED.
          Must be fast (low reverse recovery time) to minimize
          switching losses. */}
      <chip
        name="D1"
        footprint="sod323"
        pcbX={12}
        pcbY={3}
        pinLabels={{ pin1: "ANODE", pin2: "CATHODE" }}
        manufacturerPartNumber="NSR0240HT1G"
        supplierPartNumbers={{ jlcpcb: ["C263575"] }}
        schPinArrangement={{
          leftSide: { direction: "top-to-bottom", pins: ["ANODE"] },
          rightSide: { direction: "top-to-bottom", pins: ["CATHODE"] },
        }}
      />

      {/* Input capacitor: 10μF, close to VIN and GND.
          Supplies instantaneous current during switching transitions
          that the battery/LDO can't deliver fast enough. */}
      <capacitor
        name="C_BOOST_IN"
        capacitance="10uF"
        footprint="0603"
        pcbX={7}
        pcbY={1}
      />

      {/* Output capacitor: 4.7μF, 25V rated (must exceed boost output).
          Smooths the pulsed output current into a steady DC for the LED.
          Voltage rating is critical — a 10V cap on a 12V output = fire. */}
      <capacitor
        name="C_BOOST_OUT"
        capacitance="4.7uF"
        footprint="0805"
        pcbX={12}
        pcbY={5}
      />

      {/* Current sense resistor: 2.0Ω.
          Sets LED current: I = 204mV / 2.0Ω = 102mA.
          This sits between the NOOD cathode and GND, with the
          FB pin connected to the junction. The TPS61169 adjusts
          its output voltage until exactly 102mA flows. */}
      <resistor
        name="R_SENSE"
        resistance="2"
        footprint="0603"
        pcbX={12}
        pcbY={7}
      />

      {/* CTRL pull-up resistor: 100kΩ to VIN.
          Ensures the CTRL pin is HIGH (LED on) by default.
          The ESP32 PWM overrides this when active. If the ESP32
          resets or crashes, the LED stays on rather than going dark. */}
      <resistor
        name="R_CTRL"
        resistance="100k"
        footprint="0402"
        pcbX={7}
        pcbY={5}
      />

      {/* Boost converter wiring — the switching loop */}
      <trace from=".U2 > .VIN" to="net.V3_3" />
      <trace from=".U2 > .GND" to="net.GND" />
      <trace from=".C_BOOST_IN > .pin1" to="net.V3_3" />
      <trace from=".C_BOOST_IN > .pin2" to="net.GND" />

      {/* SW → Inductor → VIN (inductor charges from supply) */}
      <trace from=".U2 > .SW" to=".L1 > .pin2" />
      <trace from=".L1 > .pin1" to="net.V3_3" />

      {/* Inductor → Diode → Output cap (energy release path) */}
      <trace from=".L1 > .pin2" to=".D1 > .ANODE" />
      <trace from=".D1 > .CATHODE" to="net.BOOST_OUT" />
      <trace from=".C_BOOST_OUT > .pin1" to="net.BOOST_OUT" />
      <trace from=".C_BOOST_OUT > .pin2" to="net.GND" />

      {/* Feedback: FB pin → junction between RSET and LED cathode */}
      <trace from=".U2 > .FB" to=".R_SENSE > .pin1" />
      <trace from=".R_SENSE > .pin2" to="net.GND" />

      {/* CTRL: ESP32 GPIO7 → TPS61169 CTRL pin (PWM dimming) */}
      <trace from=".U1 > .GPIO7" to=".U2 > .CTRL" />
      <trace from=".R_CTRL > .pin1" to="net.V3_3" />
      <trace from=".R_CTRL > .pin2" to=".U2 > .CTRL" />

      {/* ============================================================
          LED Output Pads — right edge
          The NOOD's anode (metal end with hole) connects to BOOST_OUT.
          The cathode connects to the FB/RSET junction.
          ============================================================ */}
      <chip
        name="J_LED"
        footprint="pinheader2"
        pcbX={13}
        pcbY={9}
        pinLabels={{ pin1: "ANODE", pin2: "CATHODE" }}
        schPinArrangement={{
          leftSide: {
            direction: "top-to-bottom",
            pins: ["ANODE", "CATHODE"],
          },
        }}
      />

      {/* LED connection: BOOST_OUT → NOOD anode, NOOD cathode → RSET → GND */}
      <trace from=".J_LED > .ANODE" to="net.BOOST_OUT" />
      <trace from=".J_LED > .CATHODE" to=".R_SENSE > .pin1" />

      {/* ============================================================
          Battery Pads — 2-pin connector for LiPo
          ============================================================ */}
      <chip
        name="J_BAT"
        footprint="pinheader2"
        pcbX={8}
        pcbY={-7}
        pinLabels={{ pin1: "BATT_POS", pin2: "BATT_NEG" }}
        schPinArrangement={{
          leftSide: {
            direction: "top-to-bottom",
            pins: ["BATT_POS", "BATT_NEG"],
          },
        }}
      />

      <trace from=".J_BAT > .BATT_POS" to="net.VBAT" />
      <trace from=".J_BAT > .BATT_NEG" to="net.GND" />

    </board>
  )
}
