/**
 * AETHER-7 BROWSER DEBUG HARNESS
 * Paste this into the Chrome Console to simulate Arduino data frames.
 */

window.AETHER_TEST = {
    simulateFrame: function(data) {
        if (typeof processIncomingData === 'function') {
            processIncomingData(data);
            console.log(`[TEST] Injected Frame: ${data}`);
        } else {
            console.error("[TEST] processIncomingData not found!");
        }
    },
    
    runScenario: function() {
        console.log("--- STARTING TEST SCENARIO ---");
        
        // 1. Breach Protocol
        setTimeout(() => this.simulateFrame("LOGIN:42"), 1000);
        
        // 2. Antenna Alignment
        setTimeout(() => this.simulateFrame("OFFSET:300"), 2000);
        setTimeout(() => this.simulateFrame("OFFSET:705"), 3000);
        
        // 3. Temperature Streaming
        setInterval(() => {
            const t = (20 + Math.random() * 5).toFixed(1);
            this.simulateFrame(`TEMP:${t}`);
        }, 1000);
        
        console.log("[TEST] Scenario scheduled. Watch the dashboard.");
    }
};

console.log("AETHER-7 Test Harness Loaded. Run 'AETHER_TEST.runScenario()' to start simulation.");
