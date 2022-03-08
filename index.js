require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(
  morgan(
    (tokens, request, response) => [
      tokens.method(request, response),
      tokens.url(request, response),
      tokens.status(request, response),
      tokens.res(request, response, 'content-length'),
      '-',
      tokens['response-time'](request, response),
      'ms',
      JSON.stringify(request.body),
    ].join(' '),
    'immediate',
  ),
);

app.get('/info', (request, response) => {
  Person.count({}).then((number) => response.send(`
  <div>
    <p>Phonebook has info for ${number} people</p>
    <p>${Date()}</p>
  </div>  
  `));
});

app.get('/', (request, response) => {
  response.send('<h1>App</h1>');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' },
  )
    .then((updatedContact) => {
      response.json(updatedContact);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      console.log(result);
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;

  if (!name.length || !number.length) {
    return response.status(400).json({
      error: 'Name or number is missing',
    });
  }

  Person.find({ name, number }).then((result) => {
    if (result.length > 0) {
      response.status(400).json({ error: 'contact already exists' });
    } else {
      const person = new Person({ name, number });
      person
        .save()
        .then((savedContact) => {
          response.json(savedContact);
        })
        .catch((error) => next(error));
    }
  });
  return 0;
});

const unknownEndpoint = (request, response) => response.status(404).send({ error: 'unknown endpoint' });

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'misformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);

  return 0;
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
