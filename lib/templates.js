/*
 * File: lib/templates.ts
 * Description:
 * Contains service planner templates for desktop computers and laptops.
 *
 * Desktop and laptop templates are kept separate on purpose. This prevents
 * laptop-only work, such as battery or screen repair, from appearing in a
 * desktop plan. It also prevents desktop-only work, such as PSU replacement
 * or case fan upgrades, from appearing in a laptop plan.
 *
 * Every category has three plan types:
 * - Diagnostic: Find the cause of the problem.
 * - Repair: Fix or replace the failed part.
 * - Upgrade: Install a better or newer part.
 *
 * Use getPlannerOptions(serviceType, deviceType) in the page to get only the
 * plans that apply to the selected device and service type.
 */
const createPlan = (description, steps) => ({
    description,
    steps: steps.map((title) => ({ title })),
});
/*
 * Desktop computer templates.
 */
export const desktopComponentTemplates = [
    {
        id: "power-supply",
        label: "Power Supply",
        order: 10,
        services: {
            diagnostic: createPlan("We’ll check whether the power supply is causing startup issues, shutdowns, or unstable performance.", [
                "Check the wall power cable, power switch, and power connections",
                "Look for loose cables, damage, burning smells, or unusual noise",
                "Check the motherboard, CPU, graphics card, and drive power cables",
                "Test the power supply with a tester or known-good power supply",
                "Check system startup, shutdown, and stability",
            ]),
            repair: createPlan("We’ll fix loose power connections or replace a power supply that has failed.", [
                "Shut down the computer and unplug it from wall power",
                "Check and reseat all power cables",
                "Remove damaged or incorrect cables",
                "Install a compatible replacement power supply if needed",
                "Use only the cables included with the replacement power supply",
                "Test startup, shutdown, and normal use",
            ]),
            upgrade: createPlan("We’ll install a stronger or better power supply to support the system you want to run.", [
                "Confirm the needed wattage and required power connections",
                "Check that the new power supply fits the case",
                "Shut down the computer and unplug it from wall power",
                "Remove the old power supply and its cables",
                "Install the new power supply using its included cables",
                "Test all parts before closing the case",
            ]),
        },
    },
    {
        id: "motherboard",
        label: "Motherboard",
        order: 20,
        services: {
            diagnostic: createPlan("We’ll check the motherboard for startup issues, damaged components, and connection problems.", [
                "Look for damage, corrosion, bent pins, or burnt areas",
                "Check startup lights, error lights, and beep codes",
                "Disconnect extra drives and USB devices",
                "Try starting with only the needed parts connected",
                "Test with known-good parts when available",
            ]),
            repair: createPlan("We’ll repair loose connections and replace any motherboard parts that are not working properly.", [
                "Shut down the computer and unplug it from wall power",
                "Check and reseat RAM, graphics card, storage, and power cables",
                "Replace the CMOS battery if it is weak or dead",
                "Replace damaged ports, cables, or small attached boards if possible",
                "Replace the motherboard if it has a major fault",
                "Check startup and connected devices after repair",
            ]),
            upgrade: createPlan("We’ll replace the motherboard to support a newer CPU platform, more features, or better compatibility.", [
                "Confirm CPU, RAM, cooler, storage, and case compatibility",
                "Back up important files and save BitLocker recovery information",
                "Move the CPU, RAM, storage, and cooler to the new motherboard",
                "Start the computer and enter BIOS setup",
                "Update BIOS and install motherboard drivers",
                "Check Windows activation, storage, ports, and network connection",
            ]),
        },
    },
    {
        id: "ram",
        label: "RAM",
        order: 30,
        services: {
            diagnostic: createPlan("We’ll check the memory sticks and slots for crashes, startup issues, or blue-screen errors.", [
                "Check that the RAM is fully seated",
                "Test one RAM stick at a time",
                "Test each RAM slot when needed",
                "Turn off XMP or EXPO if the system is unstable",
                "Run MemTest86 or another memory test",
            ]),
            repair: createPlan("We’ll fix memory seating issues and replace any RAM that is failing or unstable.", [
                "Shut down the computer and unplug it from wall power",
                "Remove and reseat the RAM",
                "Clean dirty RAM contacts if needed",
                "Set memory settings back to safe defaults",
                "Replace failed RAM with matching compatible RAM",
                "Run a memory test after the repair",
            ]),
            upgrade: createPlan("We’ll add more memory or improve performance with faster, compatible RAM.", [
                "Confirm the RAM type, speed, and maximum supported capacity",
                "Choose matching RAM sticks when possible",
                "Install RAM in the recommended motherboard slots",
                "Check the total memory in BIOS and Windows",
                "Turn on XMP or EXPO if supported",
                "Run a memory test before finishing",
            ]),
        },
    },
    {
        id: "cpu",
        label: "CPU",
        order: 40,
        services: {
            diagnostic: createPlan("We’ll check the processor for overheating, crashes, and startup issues.", [
                "Check CPU temperature at idle and while under load",
                "Check that the CPU cooler is mounted correctly",
                "Check CPU speed and detection in BIOS",
                "Look for crashes, shutdowns, or error messages under load",
                "Run a CPU stress test and record the result",
            ]),
            repair: createPlan("We’ll fix cooling, installation, or BIOS support issues affecting the processor.", [
                "Shut down the computer and unplug it from wall power",
                "Remove the CPU cooler and inspect the CPU area",
                "Check the CPU socket and pins for damage",
                "Apply fresh thermal paste and reinstall the cooler",
                "Update BIOS if the CPU needs newer support",
                "Check temperatures and stability after repair",
            ]),
            upgrade: createPlan("We’ll install a newer or faster processor that is compatible with your system.", [
                "Confirm CPU socket, motherboard, BIOS, and cooler compatibility",
                "Back up important files and save BitLocker recovery information",
                "Update BIOS before changing the CPU if needed",
                "Install the new CPU and fresh thermal paste",
                "Install the cooler and check that it is secure",
                "Check CPU detection, temperatures, and stability",
            ]),
        },
    },
    {
        id: "gpu",
        label: "Graphics Card",
        order: 50,
        services: {
            diagnostic: createPlan("We’ll check the graphics card, display connections, drivers, and any stability issues.", [
                "Check monitor cables, monitor input, and graphics card ports",
                "Check that the graphics card is fully seated",
                "Check graphics card power cables",
                "Test with another monitor, cable, or graphics card if available",
                "Reinstall the graphics driver",
                "Run a graphics test and check for crashes or screen artifacts",
            ]),
            repair: createPlan("We’ll fix connection, cooling, or driver issues and repair the graphics card if needed.", [
                "Shut down the computer and unplug it from wall power",
                "Remove and reseat the graphics card",
                "Check power cables and the PCIe slot",
                "Clean dust from the graphics card fans and heat sink",
                "Replace serviceable graphics card fans if they have failed",
                "Install a clean graphics driver and test display output",
            ]),
            upgrade: createPlan("We’ll install a newer or faster graphics card to improve performance and visuals.", [
                "Confirm case space, power supply wattage, and power connectors",
                "Check that the motherboard has a compatible PCIe slot",
                "Remove the old graphics card",
                "Install the new graphics card and connect power cables",
                "Remove old drivers if changing graphics card brands",
                "Install the current driver and test games or graphics software",
            ]),
        },
    },
    {
        id: "storage",
        label: "Storage Drive",
        order: 60,
        services: {
            diagnostic: createPlan("We’ll check the drives for health, speed, startup issues, and connection problems.", [
                "Check that the drive appears in BIOS and Windows",
                "Check drive cables or M.2 seating",
                "Check drive health and SMART status",
                "Run a drive health and speed test",
                "Try booting with extra drives disconnected",
                "Note any important files that may need backup",
            ]),
            repair: createPlan("We’ll fix storage connections, repair boot issues, or replace a drive that is failing.", [
                "Back up important files before making changes",
                "Check and reseat drive cables or M.2 drives",
                "Replace damaged SATA cables or mounting hardware",
                "Repair Windows boot files if approved",
                "Replace a failing drive if health tests show problems",
                "Check boot, drive letters, and file access after repair",
            ]),
            upgrade: createPlan("We’ll install a larger or faster drive to add space and improve performance.", [
                "Confirm the drive type, size, and connection type",
                "Back up files and confirm the cloning or reinstall plan",
                "Install the new drive",
                "Clone the old drive or install Windows as approved",
                "Set the correct boot drive in BIOS if needed",
                "Check drive health, storage size, and boot behavior",
            ]),
        },
    },
    {
        id: "windows",
        label: "Windows",
        order: 70,
        services: {
            diagnostic: createPlan("We’ll check Windows for startup issues, driver problems, updates, software conflicts, and crashes.", [
                "Check whether Windows starts normally",
                "Check Device Manager for missing or failed devices",
                "Check recent errors and crash details",
                "Test with Windows recovery media or a live USB if needed",
                "Check system files, drive health, and Windows activation",
            ]),
            repair: createPlan("We’ll repair Windows startup issues, driver problems, updates, and damaged system files.", [
                "Confirm backup instructions and BitLocker recovery information",
                "Repair Windows startup files and system files if approved",
                "Remove broken drivers or software",
                "Install needed Windows updates and device drivers",
                "Check Windows activation and Device Manager",
                "Restart and test normal use",
            ]),
            upgrade: createPlan("We’ll reinstall, update, or move Windows to the approved version for your system.", [
                "Confirm backup instructions and reinstall approval",
                "Save BitLocker recovery information before changes",
                "Install or upgrade Windows",
                "Install motherboard, network, audio, and graphics drivers",
                "Install approved updates and required software",
                "Check activation, startup, and normal use",
            ]),
        },
    },
    {
        id: "cpu-cooling",
        label: "CPU Cooling",
        order: 80,
        services: {
            diagnostic: createPlan("We’ll check the cooling system, fans, pump, and temperature readings to look for overheating.", [
                "Check CPU temperature at idle and while under load",
                "Check that the cooler is mounted tightly",
                "Check that cooler fans are spinning",
                "Check pump speed if the computer uses liquid cooling",
                "Listen for fan grinding, clicking, or pump noise",
                "Check for overheating or slowdowns under load",
            ]),
            repair: createPlan("We’ll repair or replace a failing cooler, fan, pump, or thermal paste to improve cooling.", [
                "Shut down the computer and unplug it from wall power",
                "Clean dust from the cooler and fans",
                "Replace failed cooler fans or a failed cooler",
                "Apply fresh thermal paste when removing the cooler",
                "Reconnect fan and pump cables to the correct headers",
                "Check temperatures and fan speed after repair",
            ]),
            upgrade: createPlan("We’ll install a larger or quieter cooler to improve airflow and keep temperatures under control.", [
                "Confirm cooler height, socket support, and RAM clearance",
                "Confirm radiator space if using liquid cooling",
                "Remove the old cooler and clean the CPU surface",
                "Install the new cooler with fresh thermal paste",
                "Connect fans and pump cables",
                "Set fan speeds and check temperatures under load",
            ]),
        },
    },
    {
        id: "case-fans",
        label: "Case Fans",
        order: 90,
        services: {
            diagnostic: createPlan("We’ll check the case fans for noise, failure, poor airflow, and settings that are not working correctly.", [
                "Check that every case fan spins",
                "Listen for clicking, grinding, or rattling",
                "Check fan cables, splitters, hubs, and motherboard headers",
                "Check that front fans pull air in and rear or top fans push air out",
                "Check temperatures and fan noise during normal use",
            ]),
            repair: createPlan("We’ll replace any case fan that is failed, loud, or damaged so airflow is restored.", [
                "Shut down the computer and unplug it from wall power",
                "Check the fan size and connector type",
                "Remove the failed fan",
                "Install the replacement fan in the correct air direction",
                "Keep fan cables away from fan blades",
                "Check fan speed, noise, and airflow",
            ]),
            upgrade: createPlan("We’ll add or upgrade case fans to improve airflow and keep the system cooler and quieter.", [
                "Plan front or bottom intake fans and rear or top exhaust fans",
                "Confirm fan size, connector type, and available headers",
                "Install the new fans in the planned locations",
                "Add a fan hub if there are not enough motherboard headers",
                "Route fan and RGB cables neatly",
                "Set fan speeds and check temperatures",
            ]),
        },
    },
];
/*
 * Laptop templates.
 */
export const laptopComponentTemplates = [
    {
        id: "charging",
        label: "Charging and Power",
        order: 10,
        services: {
            diagnostic: createPlan("We’ll check the charger, charging port, battery connection, and power startup behavior.", [
                "Check the charger cable, connector, and power rating",
                "Check whether the laptop charges while turned on and off",
                "Check the charging port for looseness or damage",
                "Test with a known-good compatible charger if available",
                "Check whether the laptop starts on charger power",
            ]),
            repair: createPlan("We’ll fix charging issues or replace the parts that are not delivering power correctly.", [
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery before opening the laptop",
                "Check the charging port and internal charging cable",
                "Replace the charging port or charging board if it is removable",
                "Replace a damaged charger with a compatible charger",
                "Check charging and startup after repair",
            ]),
            upgrade: createPlan("We’ll install a better compatible charger or charging setup that matches your laptop.", [
                "Confirm the laptop charging wattage and connector type",
                "Confirm USB-C charging support if using USB-C",
                "Choose a compatible charger or dock",
                "Connect the charger or dock",
                "Check charging speed and device detection",
                "Check that the laptop remains stable while charging",
            ]),
        },
    },
    {
        id: "battery",
        label: "Battery",
        order: 20,
        services: {
            diagnostic: createPlan("We’ll check battery health, charge behavior, runtime, and any unexpected shutdowns.", [
                "Check battery health and remaining capacity",
                "Check for battery swelling or a raised keyboard or trackpad",
                "Check battery charging and discharge behavior",
                "Test the laptop on charger power only if appropriate",
                "Check for shutdowns when the charger is unplugged",
            ]),
            repair: createPlan("We’ll replace a battery that is weak, swollen, damaged, or no longer working properly.", [
                "Back up important files before opening the laptop",
                "Shut down the laptop and unplug the charger",
                "Open the laptop and disconnect the internal battery",
                "Remove the old battery safely",
                "Install a compatible replacement battery",
                "Check battery detection, charging, and normal startup",
            ]),
            upgrade: createPlan("We’ll install a larger compatible battery if it is available for your laptop model.", [
                "Confirm the battery model, voltage, size, and connector",
                "Confirm that a larger battery fits the laptop",
                "Shut down the laptop and unplug the charger",
                "Remove the old battery",
                "Install the upgraded compatible battery",
                "Check battery health and charging after installation",
            ]),
        },
    },
    {
        id: "mainboard",
        label: "Mainboard",
        order: 30,
        services: {
            diagnostic: createPlan("We’ll check the mainboard for startup, charging, port, and physical damage issues.", [
                "Check for liquid damage, corrosion, burning smells, or damaged parts",
                "Check power lights, charging lights, and startup behavior",
                "Disconnect extra parts when possible to narrow down the problem",
                "Check internal cables and small attached boards",
                "Decide whether the laptop needs mainboard repair or replacement",
            ]),
            repair: createPlan("We’ll repair connection issues and replace any attached board or part that can be serviced.", [
                "Back up important files before opening the laptop",
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Check and reseat internal cables and small attached boards",
                "Replace removable charging, USB, or button boards if needed",
                "Record when the mainboard needs specialty repair or replacement",
            ]),
            upgrade: createPlan("We’ll replace the mainboard with a compatible part so the laptop can run properly again.", [
                "Confirm the replacement board matches the laptop model",
                "Back up important files and save BitLocker recovery information",
                "Move compatible parts to the replacement mainboard",
                "Reconnect the screen, battery, storage, cooling, and input cables",
                "Start the laptop and check BIOS settings",
                "Check Windows, ports, wireless, audio, and charging",
            ]),
        },
    },
    {
        id: "ram",
        label: "RAM",
        order: 40,
        services: {
            diagnostic: createPlan("We’ll check the memory for crashes, blue-screen errors, and startup issues.", [
                "Check whether the laptop has removable RAM",
                "Check that removable RAM is fully seated",
                "Test one RAM stick at a time when possible",
                "Check BIOS memory settings",
                "Run a memory test",
            ]),
            repair: createPlan("We’ll fix memory seating issues and replace any RAM that is failing or unstable.", [
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Remove and reseat the RAM",
                "Set memory settings back to safe defaults",
                "Replace failed removable RAM with compatible RAM",
                "Run a memory test after repair",
            ]),
            upgrade: createPlan("We’ll add more compatible RAM to improve speed and multitasking.", [
                "Check whether the laptop RAM can be upgraded",
                "Confirm RAM type, speed, maximum capacity, and slot count",
                "Shut down the laptop and disconnect the battery",
                "Install the new RAM",
                "Check the total memory in BIOS and Windows",
                "Run a memory test before finishing",
            ]),
        },
    },
    {
        id: "processor-graphics",
        label: "Processor and Graphics",
        order: 50,
        services: {
            diagnostic: createPlan("We’ll check for processor or graphics issues, including overheating and display problems.", [
                "Check processor and graphics temperatures",
                "Check for slowdowns, crashes, or shutdowns under load",
                "Check display output on the laptop screen and an external screen",
                "Check graphics drivers and Device Manager",
                "Run a safe processor or graphics test",
            ]),
            repair: createPlan("We’ll repair processor or graphics issues that can be fixed without replacing the mainboard.", [
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Clean dust from the cooling system",
                "Replace thermal paste if the heat sink is removed",
                "Reinstall processor and graphics drivers",
                "Record if the processor or graphics chip requires mainboard replacement",
            ]),
            upgrade: createPlan("We’ll set up a supported external graphics or dock solution to improve performance. (SPO)", [
                "Check whether the laptop supports an external graphics connection",
                "Confirm port, dock, power, and graphics card compatibility",
                "Install the supported dock or external graphics hardware",
                "Install the required drivers",
                "Connect an external display if needed",
                "Check graphics performance and stability",
            ]),
        },
    },
    {
        id: "storage",
        label: "Storage Drive",
        order: 60,
        services: {
            diagnostic: createPlan("We’ll check the storage drive for health, startup issues, and connection problems.", [
                "Check that the drive appears in BIOS and Windows",
                "Check M.2 or SATA drive seating",
                "Check drive health and SMART status",
                "Run a drive health and speed test",
                "Check for boot errors and file access problems",
            ]),
            repair: createPlan("We’ll fix storage connections, repair boot problems, or replace a failing drive.", [
                "Back up important files before making changes",
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Reseat the drive and check the connector",
                "Repair Windows boot files if approved",
                "Replace a failing drive and check boot behavior",
            ]),
            upgrade: createPlan("We’ll install a larger or faster storage drive to improve speed and available space.", [
                "Confirm drive size, type, and laptop compatibility",
                "Back up files and confirm the cloning or reinstall plan",
                "Shut down the laptop and disconnect the battery",
                "Install the new drive",
                "Clone the old drive or install Windows as approved",
                "Check drive health, storage size, and startup",
            ]),
        },
    },
    {
        id: "windows",
        label: "Windows",
        order: 70,
        services: {
            diagnostic: createPlan("We’ll check Windows for startup issues, driver problems, updates, software conflicts, and crashes.", [
                "Check whether Windows starts normally",
                "Check Device Manager for missing or failed devices",
                "Check recent errors and crash details",
                "Test with Windows recovery media or a live USB if needed",
                "Check system files, drive health, and Windows activation",
            ]),
            repair: createPlan("We’ll repair Windows startup issues, driver problems, updates, and damaged system files.", [
                "Confirm backup instructions and BitLocker recovery information",
                "Repair Windows startup files and system files if approved",
                "Remove broken drivers or software",
                "Install needed Windows updates and laptop drivers",
                "Check Windows activation and Device Manager",
                "Restart and test normal use",
            ]),
            upgrade: createPlan("We’ll reinstall, update, or move Windows to the approved version for your laptop.", [
                "Confirm backup instructions and reinstall approval",
                "Save BitLocker recovery information before changes",
                "Install or upgrade Windows",
                "Install laptop chipset, network, audio, and graphics drivers",
                "Install approved updates and required software",
                "Check activation, startup, and normal use",
            ]),
        },
    },
    {
        id: "cooling-fans",
        label: "Cooling and Fans",
        order: 80,
        services: {
            diagnostic: createPlan("We’ll check the cooling system, fans, airflow, and temperature readings for overheating.", [
                "Check processor and graphics temperatures",
                "Check whether the fan starts and changes speed",
                "Listen for clicking, grinding, or rattling",
                "Check vents for dust buildup",
                "Check for overheating, slowdowns, or shutdowns",
            ]),
            repair: createPlan("We’ll clean the cooling system or replace the laptop fans and parts that are not working properly.", [
                "Back up important files before opening the laptop",
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Clean dust from fans, heat sinks, and vents",
                "Replace a failed fan or heat sink assembly",
                "Apply fresh thermal paste if the heat sink is removed",
                "Check temperatures and fan behavior after repair",
            ]),
            upgrade: createPlan("We’ll improve the cooling setup when a compatible upgrade is available for your laptop.", [
                "Confirm compatible fan and heat sink options for the laptop",
                "Check whether a higher-performance cooling part is available",
                "Install the approved cooling part",
                "Apply fresh thermal paste if the heat sink is removed",
                "Check fan behavior and temperatures under load",
                "Confirm that the bottom cover and vents fit correctly",
            ]),
        },
    },
    {
        id: "display",
        label: "Screen and Display",
        order: 90,
        services: {
            diagnostic: createPlan("We’ll check the screen, cable, hinges, and external display output for visible problems.", [
                "Check brightness, flickering, lines, dead pixels, and backlight",
                "Test with an external monitor",
                "Move the lid slowly and check for display changes",
                "Check screen cable areas near the hinges",
                "Check screen settings and graphics drivers",
            ]),
            repair: createPlan("We’ll replace the screen, cable, bezel, or display part that is damaged or failing.", [
                "Back up important files before opening the laptop",
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Confirm the screen size, connector, resolution, and refresh rate",
                "Replace the damaged screen, cable, bezel, or display assembly",
                "Check brightness, image quality, camera, and lid movement",
            ]),
            upgrade: createPlan("We’ll install a better compatible screen to improve brightness, resolution, and overall display quality.", [
                "Confirm screen size, connector, mounting, resolution, and refresh rate",
                "Confirm that the screen cable supports the new screen",
                "Shut down the laptop and disconnect the battery",
                "Install the upgraded compatible screen",
                "Check brightness, resolution, refresh rate, and image quality",
                "Check lid movement and cable routing",
            ]),
        },
    },
    {
        id: "keyboard-touchpad",
        label: "Keyboard and Touchpad",
        order: 100,
        services: {
            diagnostic: createPlan("We’ll check the keyboard, lights, touchpad movement, clicks, and gestures for issues.", [
                "Test every keyboard key and function key",
                "Test keyboard backlight if the laptop has one",
                "Test touchpad movement, clicking, scrolling, and gestures",
                "Check for liquid damage or battery swelling",
                "Test with an external keyboard and mouse",
            ]),
            repair: createPlan("We’ll replace the keyboard, touchpad, button board, or cable that is failing.", [
                "Back up important files before opening the laptop",
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Check keyboard and touchpad cables",
                "Replace the failed keyboard, touchpad, palm rest, or cable",
                "Test all keys, lighting, clicks, and gestures",
            ]),
            upgrade: createPlan("We’ll install a compatible keyboard or touchpad assembly with the features you want.", [
                "Confirm keyboard layout, backlight support, and laptop compatibility",
                "Confirm touchpad and palm-rest compatibility",
                "Shut down the laptop and disconnect the battery",
                "Install the upgraded compatible part",
                "Install required drivers if needed",
                "Test keys, lighting, touchpad movement, clicks, and gestures",
            ]),
        },
    },
    {
        id: "ports-wireless",
        label: "Ports and Wireless",
        order: 110,
        services: {
            diagnostic: createPlan("We’ll check the laptop ports, audio, Wi-Fi, Bluetooth, and other connection points.", [
                "Test each port with a known-good cable or device",
                "Check ports for dirt, bent pins, looseness, or damage",
                "Check Wi-Fi and Bluetooth connection",
                "Check audio input and output",
                "Check Device Manager for driver problems",
            ]),
            repair: createPlan("We’ll repair or replace the port board, wireless card, antenna, or cable that is not working.", [
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Clean safe-to-clean dirt from affected ports",
                "Check internal port boards, wireless card, antennas, and cables",
                "Replace removable damaged parts if available",
                "Check ports, audio, Wi-Fi, and Bluetooth after repair",
            ]),
            upgrade: createPlan("We’ll upgrade the wireless setup, docking support, or compatible expansion hardware.", [
                "Confirm wireless card, antenna, port, and BIOS compatibility",
                "Check whether the laptop supports the planned dock or adapter",
                "Shut down the laptop and disconnect the battery if opening it",
                "Install the upgraded wireless card or supported hardware",
                "Install needed drivers",
                "Check Wi-Fi speed, Bluetooth, ports, charging, and display output",
            ]),
        },
    },
    {
        id: "hinges-chassis",
        label: "Hinges and Chassis",
        order: 120,
        services: {
            diagnostic: createPlan("We’ll check the hinges, lid, cover, screws, and movement for damage or looseness.", [
                "Check both hinges and the areas around them",
                "Look for cracked plastic, loose screws, or separated covers",
                "Open and close the lid slowly",
                "Check for screen flickering while moving the lid",
                "Check for cable damage near the hinges",
            ]),
            repair: createPlan("We’ll repair or replace the hinges, covers, brackets, and mounting hardware that are damaged.", [
                "Back up important files before opening the laptop",
                "Shut down the laptop and unplug the charger",
                "Disconnect the internal battery",
                "Open only the needed parts of the laptop",
                "Replace damaged hinges, covers, brackets, screws, or mounts",
                "Check lid movement, screen output, camera, and Wi-Fi",
            ]),
            upgrade: createPlan("We’ll replace the laptop chassis, lid, palm rest, or display assembly with a matching upgrade.", [
                "Confirm the replacement chassis or assembly matches the laptop model",
                "Check that screen, antenna, port, and keyboard parts will fit",
                "Back up important files before moving internal parts",
                "Move compatible parts into the replacement assembly",
                "Check screw placement and cable routing",
                "Check lid alignment, ports, screen, keyboard, and wireless",
            ]),
        },
    },
];
/*
 * Returns plans for one device type and one service type.
 *
 * Example:
 * getPlannerOptions("repair", "laptop")
 */
export const getPlannerOptions = (serviceType, deviceType) => {
    const templates = deviceType === "desktop"
        ? desktopComponentTemplates
        : laptopComponentTemplates;
    return templates
        .map((component) => {
        const service = component.services[serviceType];
        return {
            id: `${deviceType}-${component.id}-${serviceType}`,
            componentId: component.id,
            label: component.label,
            description: service.description,
            order: component.order,
            deviceType,
            serviceType,
            steps: service.steps,
        };
    })
        .sort((first, second) => first.order - second.order);
};
/*
 * Prebuilt lists for pages that prefer direct imports.
 */
export const desktopDiagnosticOptions = getPlannerOptions("diagnostic", "desktop");
export const desktopRepairOptions = getPlannerOptions("repair", "desktop");
export const desktopUpgradeOptions = getPlannerOptions("upgrade", "desktop");
export const laptopDiagnosticOptions = getPlannerOptions("diagnostic", "laptop");
export const laptopRepairOptions = getPlannerOptions("repair", "laptop");
export const laptopUpgradeOptions = getPlannerOptions("upgrade", "laptop");
export const plannerOptionsByDevice = {
    desktop: {
        diagnostic: desktopDiagnosticOptions,
        repair: desktopRepairOptions,
        upgrade: desktopUpgradeOptions,
    },
    laptop: {
        diagnostic: laptopDiagnosticOptions,
        repair: laptopRepairOptions,
        upgrade: laptopUpgradeOptions,
    },
};
/*
 * Optional tools are also separated by device type.
 */
export const desktopOptionalTools = [
    {
        id: "psu-tester",
        label: "Power Supply Tester",
        description: "Add a power supply tester result.",
        step: "Power supply tester result",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair"],
    },
    {
        id: "voltmeter",
        label: "Voltmeter",
        description: "Add direct power supply voltage readings.",
        step: "Voltage readings for 12V, 5V, and 3.3V power rails",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair"],
    },
    {
        id: "motherboard-speaker",
        label: "Motherboard Speaker",
        description: "Add startup beep-code results.",
        step: "Motherboard beep-code or startup result",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair"],
    },
    {
        id: "breadboard-test",
        label: "Out-of-Case Test",
        description: "Test the main parts outside the computer case.",
        step: "Out-of-case test parts used and startup result",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair"],
    },
    {
        id: "memtest86",
        label: "MemTest86",
        description: "Add a RAM test with passes and errors.",
        step: "MemTest86 passes completed and errors found",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "ddu",
        label: "DDU",
        description: "Add a clean graphics driver removal step.",
        step: "Graphics driver removal and clean driver installation result",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "cpu-stress-test",
        label: "CPU Stress Test",
        description: "Add a CPU temperature and stability test.",
        step: "CPU test length, temperature, errors, and result",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "gpu-stress-test",
        label: "Graphics Stress Test",
        description: "Add a graphics temperature and stability test.",
        step: "Graphics test length, temperature, artifacts, and result",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "drive-test",
        label: "Drive Test",
        description: "Add a drive health and speed test.",
        step: "Drive health, scan, speed, and result",
        deviceType: "desktop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
];
export const laptopOptionalTools = [
    {
        id: "battery-report",
        label: "Battery Report",
        description: "Add battery health and capacity details.",
        step: "Battery health, capacity, cycle count, and charging result",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "manufacturer-test",
        label: "Laptop Hardware Test",
        description: "Add the laptop maker's built-in hardware test.",
        step: "Laptop hardware test results",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair"],
    },
    {
        id: "windows-recovery-media",
        label: "Windows Recovery Media",
        description: "Add a Windows startup, repair, or reinstall test.",
        step: "Windows recovery media startup, repair, or reinstall result",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "linux-live-usb",
        label: "Linux Live USB",
        description: "Test the laptop outside the installed Windows system.",
        step: "Linux live USB hardware detection and stability result",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair"],
    },
    {
        id: "memtest86",
        label: "MemTest86",
        description: "Add a RAM test with passes and errors.",
        step: "MemTest86 passes completed and errors found",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "temperature-test",
        label: "Temperature Test",
        description: "Add a temperature and fan behavior test.",
        step: "Temperature test length, fan behavior, and result",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "drive-test",
        label: "Drive Test",
        description: "Add a drive health and speed test.",
        step: "Drive health, scan, speed, and result",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
    {
        id: "external-display",
        label: "External Display Test",
        description: "Test the laptop with another monitor or TV.",
        step: "External display connection and output result",
        deviceType: "laptop",
        serviceTypes: ["diagnostic", "repair", "upgrade"],
    },
];
export const optionalToolsByDevice = {
    desktop: desktopOptionalTools,
    laptop: laptopOptionalTools,
};
/*
 * Default post-service checklist values.
 */
export const defaultCompletionFlags = {
    windows: false,
    motherboardDrivers: false,
    gpuDrivers: false,
    bitlocker: false,
    bios: false,
    memoryProfile: false,
    resizeBar: false,
    secureBoot: false,
    cleaned: false,
    connectivity: false,
    fanTest: false,
    temperatureTest: false,
    storageHealth: false,
    batteryHealth: false,
    displayTest: false,
    keyboardTouchpadTest: false,
    portsTest: false,
    audioVideoTest: false,
    finalBootTest: false,
};
