const os = require('os');
const nodemailer = require('nodemailer');
const { exec } = require('child_process');
const fs = require('fs');

// Load configuration
const config = require('../config.json');

// Function to check resources
function checkResources() {
    // os.arch()
    // os.constants
    console.log('dfghjkl--->>>>',os.uptime())
    const cpuUsage = os.loadavg()[0]; // 1-minute average
    const freeMemory = os.freemem() / os.totalmem() * 100;

    // console.log(`CPU: ${cpuUsage.toFixed(2)}%, Memory Free: ${freeMemory.toFixed(2)}%`);

    if (cpuUsage > config.cpuThreshold) {
        // console.log("In cpuusage---->",cpuUsage)
        // triggerAction('High CPU Usage', `CPU usage is at ${cpuUsage.toFixed(2)}%`);
    }

    if (freeMemory < config.memoryThreshold) {
        // console.log("in free memory----->>>",freeMemory)
        // triggerAction('Low Memory', `Free memory is at ${freeMemory.toFixed(2)}%`);
        // exec('echo "Clearing cache..." && sync && echo 3 > /proc/sys/vm/drop_caches', (err) => {
        //     if (err) console.error(`Error clearing cache: ${err.message}`);
        // });
    }
}

// Function to trigger actions
function triggerAction(alertType, message) {
    console.log(`ALERT: ${alertType} - ${message}`);
    fs.appendFileSync('./logs/events.log', `${new Date().toISOString()} - ${alertType}: ${message}\n`);

    // Send email notification
    const transporter = nodemailer.createTransport(config.smtp);
    transporter.sendMail({
        from: config.smtp.auth.user,
        to: config.alertEmail,
        subject: alertType,
        text: message,
    }, (err, info) => {
        if (err) console.error(`Error sending email: ${err.message}`);
        else console.log(`Email sent: ${info.response}`);
    });
}

// Start monitoring
setInterval(checkResources, config.checkInterval * 10);
