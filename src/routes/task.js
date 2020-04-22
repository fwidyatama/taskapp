
const express = require('express');
const app = express();
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router()
app.use(router)


router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(200).send(task);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

router.get('/tasks', auth, async (req, res) => {

    try {
        await req.user.populate('tasks').execPopulate();
        res.status(200).send(req.user.tasks);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {

        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            res.status(404).send();
        }
        res.status(200).send(task);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

router.patch('/tasks/:id', async (req, res) => {
    const requestField = Object.keys(req.body);
    const field = ['description', 'completed'];
    const isValid = requestField.every((update) => {
        return field.includes(update);
    })

    if (!isValid) {
        res.status(404).send({ error: "Invalid field" });
    }

    try {
        const task = await Task.findById(req.params.id)

        requestField.forEach((update) => {
            task[update] = req.body[update];
        })

        await task.save()
        res.status(200).send(task);

    }
    catch (e) {
        res.status(500).send(e);
    }
})


router.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id
    try {

        const task = await Task.findByIdAndDelete(id);
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }

})

module.exports = router;