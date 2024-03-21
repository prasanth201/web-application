const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/student_tasks', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Define schemas for courses and tasks
const courseSchema = new mongoose.Schema({
    courseId: String,
    courseName: String
});

const taskSchema = new mongoose.Schema({
    courseId: String,
    taskName: String,
    dueDate: Date,
    additionalDetails: String
});

// Create models for courses and tasks
const Course = mongoose.model('Course', courseSchema);
const Task = mongoose.model('Task', taskSchema);

// Middleware
app.use(bodyParser.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Route to add a task
app.post('/addTask', async (req, res) => {
    try {
        const { courseId, taskName, dueDate, additionalDetails } = req.body;
        
        console.log('Received task data:', req.body); // Add this line for debugging

        const newTask = new Task({
            courseId,
            taskName,
            dueDate,
            additionalDetails
        });

        // Save the new task to the database
        await newTask.save();

        // Respond with a success status
        res.sendStatus(201); // Created
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Failed to add task' });
    }
});


// Route to retrieve tasks by courseId
app.get('/courses/:courseId/tasks', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const tasks = await Task.find({ courseId });

        if (tasks.length === 0) {
            res.status(404).json({ message: 'No tasks found for the provided course ID' });
        } else {
            res.json(tasks);
        }
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.sendStatus(500); // Internal Server Error
    }
});

// Handle root route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
    res.sendFile(indexPath);
});
// Start server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
