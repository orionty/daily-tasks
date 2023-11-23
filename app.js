const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const TASKS_FILE_PATH = 'tasks.txt';

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post('/saveTasks', (req, res) => {
  const tasks = req.body;
  const textTasks = tasks.map((task) => `${task.date} ${task.time} - ${task.text} - ${task.completed}`).join('\n');

  fs.writeFile(TASKS_FILE_PATH, textTasks, 'utf8', (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save tasks' });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/getTasks', (req, res) => {
  fs.readFile(TASKS_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.json([]); // File doesn't exist, return an empty array
      } else {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
      }
    } else {
      const tasks = data
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [date, time, text, completed] = line.split(' - ');
          return {
            date,
            time,
            text,
            completed: completed === 'true',
          };
        });

      res.json(tasks);
    }
  });
});

// Send email notifications for approaching tasks
const sendEmailNotifications = (tasks) => {
  const currentTime = new Date();

  tasks.forEach((task) => {
    const taskDateTime = new Date(`${task.date} ${task.time}`);
    const timeDiff = taskDateTime.getTime() - currentTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    // Send email notification 15 minutes before the task time
    if (minutesDiff > 0 && minutesDiff <= 15) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: 'Task Reminder',
        text: `Task Reminder: ${task.text} at ${task.date} ${task.time}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }
  });
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Check for approaching tasks every 1 minute
setInterval(() => {
  fs.readFile(TASKS_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading tasks for notifications:', err);
    } else {
      const tasks = data
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [date, time, text, completed] = line.split(' - ');
          return {
            date,
            time,
            text,
            completed: completed === 'true',
          };
        });

      sendEmailNotifications(tasks);
    }
  });
}, 60000); // 1 minute interval
