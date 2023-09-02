require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('./models/note');

const app = express();

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

// const password = process.argv[2];

// const url = `mongodb+srv://fullstack:${password}@cluster0.ijg0dkg.mongodb.net/noteApp?retryWrites=true&w=majority`;

// mongoose.set('strictQuery', false);
// mongoose.connect(url);

// const noteSchema = new mongoose.Schema({
//     content: String,
//     important: Boolean,
// });

// noteSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString();
//         delete returnedObject._id;
//         delete returnedObject.__v;
//     }
// });

// const Note = mongoose.model('Note', noteSchema);

// let notes = [
//     {
//       id: 1,
//       content: "HTML is easy",
//       important: true
//     },
//     {
//       id: 2,
//       content: "Browser can execute only JavaScript",
//       important: false
//     },
//     {
//       id: 3,
//       content: "GET and POST are the most important methods of HTTP protocol",
//       important: true
//     }
//   ]

// app.get('/', (request, response) => {
//     response.send('<h1>Hello World!</h1>');
// });

// app.get('/api/notes', (request, response) => {
//     response.json(notes);
// });
app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes);
    });
});

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note);
            } else {
                response.status(404).end();
            }
        })
        .catch (error => next(error));
        // .catch(error => {
        //     console.log(error);
        //     response.status(400).send({ error: 'malformatted id' });
        // });
    // const id = Number(request.params.id);
    // const note = notes.find(note => note.id === id);

    // if (note) {
    //     response.json(note);
    // }
    // else {
    //     response.status(404).end();
    // }
});

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

// app.delete('/api/notes/:id', (request, repsonse) => {
//     const id = Number(request.params.id);
//     notes = notes.filter(note => note.id !== id);
    
//     response.status(204).end();
// });

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1;
}

app.post('/api/notes', (request, response, next) => {
    const body = request.body;

    // potential exceptions changed to be passed to
    // error handler middleware
    // if (body.content === undefined) {
    //     return response.status(400).json({
    //         error: 'content missing'
    //     });
    // }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    });

    note.save()
        .then(savedNote => {
            response.json(savedNote);
        })
        .catch(error => next(error));

    // const note = {
    //     content: body.content,
    //     important: body.important || false,
    //     id: generateId(),
    // }

    // notes = notes.concat(note);

    // response.json(note);
});

// toggling the importance of a note

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body;

    // const note = {
    //     content: body.content,
    //     important: body.important,
    // }

    Note.findByIdAndUpdate(
        request.params.id,
        { content, important }, 
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedNote => {
            response.json(updatedNote);
        })
        .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unkown endpoint' });
}

const errorHandler = (error, request, response, next) => {
    console.log(error.message);

    if (error.name === 'CastError') {
        return reponse.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'Validation Error') {
        return response.status(400).json({ error: error.message });
    }

    next(error);
}

// handler of requests with unknown endpoint
// this has to be the second to last loaded middleware
app.use(unknownEndpoint);
// handler of requests with result to errors
// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// const http = require('http');
  
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' });
//     response.end(JSON.stringify(notes));
// });
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'text/plain' });
//     response.end('Hello World');
// });

// const PORT = 3003;
// app.listen(PORT);
// console.log(`Server running on port ${PORT}`);