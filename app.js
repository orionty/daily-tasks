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


app.post('/saveTasks', (req, res) => {
  const tasks = req.body;
  const textTasks = tasks.map((task) => `${task.date} ${task.time}  ${task.text}`).join('\n');

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
          const [date, time, ...textArray] = line.split(' ');
          const completedIndex = textArray.indexOf('-');
          const completed = completedIndex !== -1 && textArray[completedIndex + 1] === 'Completed';
          return {
            date,
            time,
            text: completed ? textArray.slice(0, completedIndex).join(' ') : textArray.join(' '),
            completed,
          };
        });

      res.json(tasks);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


