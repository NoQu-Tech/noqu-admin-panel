process.env.NODE_EXTRA_CA_CERTS = '/etc/pki/tls/certs/ca-bundle.crt';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const util = require('util');


// Paths
const STDOUT_LOG_PATH = path.join(__dirname, 'stdout.log');
const STDERR_LOG_PATH = path.join(__dirname, 'stderr.log');

// Function to create WriteStreams
let stdoutStream = fs.createWriteStream(STDOUT_LOG_PATH, { flags: 'a' });
let stderrStream = fs.createWriteStream(STDERR_LOG_PATH, { flags: 'a' });

const recreateStreamsIfDeleted = () => {
  if (!fs.existsSync(STDOUT_LOG_PATH)) {
    stdoutStream.end();
    stdoutStream = fs.createWriteStream(STDOUT_LOG_PATH, { flags: 'a' });
  }
  if (!fs.existsSync(STDERR_LOG_PATH)) {
    stderrStream.end();
    stderrStream = fs.createWriteStream(STDERR_LOG_PATH, { flags: 'a' });
  }
};

// Override console.log
console.log = (...args) => {
  const message = new Date().toISOString() + ' - ' + util.format(...args) + '\n';
  recreateStreamsIfDeleted();
  stdoutStream.write(message);
  process.stdout.write(message);
};

console.error = (...args) => {
  const errorMessage = new Date().toISOString() + ' [ERROR] - ' + util.format(...args) + '\n';
  recreateStreamsIfDeleted();
  stderrStream.write(errorMessage);
  process.stderr.write(errorMessage);
};


// Import other parts
const Routes = require('./routes/routes');
const db = require('./models/db'); // Ensure DB is initialized

const app = express();
const port = process.env.PORT || 3003;

// Middleware
const corsOptions = {
  origin: ['http://localhost:5174','http://localhost:5173', 'https://noqu.co.in', 'https://www.noqu.co.in', 'https://www.adm.noqu.co.in', 'https://adm.noqu.co.in'], // allow both localhost (for development) and your live domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(compression());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public_html/uploads')));

// Parse body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', Routes);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
