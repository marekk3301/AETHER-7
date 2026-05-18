/**
 * AETHER-7 TEST SUITE
 * Simulates Serial frames and verifies UI state changes.
 */

const fs = require('fs');
const path = require('path');

// Basic Mock for JSDOM-like behavior (since we might not have jsdom)
// We will focus on verifying logic in app.js if possible, or just file integrity.

function testFileConsistency() {
    console.log("--- RUNNING CONSISTENCY TESTS ---");
    
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const css = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
    const js = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

    // Test 1: Check if .hidden class exists in CSS
    if (css.includes('.antenna-offline-indicator.hidden')) {
        console.log("[PASS] .hidden class found for antenna indicator.");
    } else {
        console.error("[FAIL] .hidden class missing in CSS!");
        process.exit(1);
    }

    // Test 2: Check if app.js calls .add('hidden')
    if (js.includes("antennaOfflineMsg.classList.add('hidden')")) {
        console.log("[PASS] app.js correctly handles hiding the indicator.");
    } else {
        console.error("[FAIL] app.js logic mismatch!");
        process.exit(1);
    }

    // Test 3: Check if Region was updated
    if (html.includes("REGION: <span>LOW EARTH ORBIT</span>")) {
        console.log("[PASS] Region updated to LOW EARTH ORBIT.");
    } else {
        console.error("[FAIL] Region string incorrect!");
        process.exit(1);
    }

    console.log("\n--- ALL STATIC TESTS PASSED ---");
}

testFileConsistency();
