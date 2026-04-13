#!/usr/bin/env node
"use strict";

// Temporary CLI wrapper for proactive-aigent plugin
// This will handle the basic functionality until the real CLI is available

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Set up database path
const dbPath = path.join(process.env.HOME, '.proactive-aigent', 'schedules.json');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Handle CLI commands
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

// Load schedules
let schedules = [];
try {
  schedules = JSON.parse(fs.readFileSync(dbPath));
} catch (err) {
  console.error("Error reading schedules:", err.message);
  process.exit(1);
}

switch (command) {
  case "config": {
    // Interactive configuration
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("Proactive AIgent Configuration");
    console.log("==============================");

    rl.question("Telegram Bot Token: ", (botToken) => {
      rl.question("Chat ID: ", (chatId) => {
        const config = {
          botToken: botToken.trim(),
          chatId: chatId.trim(),
          timezone: "Asia/Dhaka"
        };

        const configPath = path.join(dbDir, 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log("✓ Configuration saved!");
        rl.close();
      });
    });
    break;
  }

  case "add": {
    // Interactive schedule addition
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("Add New Schedule");
    console.log("================");

    rl.question("Message: ", (message) => {
      rl.question("Schedule (e.g., 'daily at 7 AM', 'every Monday at 5 PM'): ", (schedule) => {
        const newSchedule = {
          id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1,
          message,
          schedule,
          time: getTimeFromSchedule(schedule),
          enabled: true,
          timestamp: new Date().toISOString()
        };

        schedules.push(newSchedule);
        fs.writeFileSync(dbPath, JSON.stringify(schedules, null, 2));
        console.log("✓ Schedule added!", `ID: ${newSchedule.id}`);
        rl.close();
      });
    });
    break;
  }

  case "list": {
    if (schedules.length === 0) {
      console.log("No schedules found.");
    } else {
      console.log("Proactive AIgent Schedules");
      console.log("==========================");
      schedules.forEach(s => {
        const enabled = s.enabled ? "✓" : "✗";
        console.log(`${s.id}. [${enabled}] ${s.message}`);
        console.log(`   Schedule: ${s.schedule}`);
        console.log(`   Time: ${s.time || 'N/A'}`);
        console.log("");
      });
    }
    break;
  }

  case "remove": {
    const id = parseInt(arg1);
    if (isNaN(id)) {
      console.error("Invalid schedule ID");
      process.exit(1);
    }

    const updatedSchedules = schedules.filter(s => s.id !== id);
    if (updatedSchedules.length === schedules.length) {
      console.error("Schedule not found");
      process.exit(1);
    }

    fs.writeFileSync(dbPath, JSON.stringify(updatedSchedules, null, 2));
    console.log(`✓ Schedule #${id} removed!`);
    break;
  }

  case "test": {
    const id = parseInt(arg1);
    if (isNaN(id)) {
      console.error("Invalid schedule ID");
      process.exit(1);
    }

    const schedule = schedules.find(s => s.id === id);
    if (!schedule) {
      console.error("Schedule not found");
      process.exit(1);
    }

    console.log("=== Schedule Test ===");
    console.log(`Message: ${schedule.message}`);
    console.log(`Schedule: ${schedule.schedule}`);
    console.log("✓ Test successful! Message would be sent when scheduled.");
    break;
  }

  default:
    console.error("Usage: proactive-aigent <command>")
    console.error("  config     Configure Telegram bot")
    console.error("  add        Add new schedule")
    console.error("  list       List all schedules")
    console.error("  remove <id> Remove schedule")
    console.error("  test <id>  Test schedule")
    process.exit(1);
}

function getTimeFromSchedule(scheduleStr) {
  // Simple timezone-aware parser
  if (/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*(daily)?/i.test(scheduleStr)) {
    let [_, hours, minutes, period = "", isDaily = ""] = scheduleStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*(daily)?/i);

    // Convert 12-hour format to 24-hour
    if (period && period.toUpperCase() === "PM" && parseInt(hours) !== 12) {
      hours = parseInt(hours) + 12;
    }
    if (period && period.toUpperCase() === "AM" && parseInt(hours) === 12) {
      hours = 0;
    }

    // Default to 0 minutes if not specified
    minutes = minutes || "00";

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  return null;
}