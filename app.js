require('dotenv').config();
require('express-async-errors');

//extra security packages 
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');



const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const authRouter = require('./routes/auth');
const jobRouter = require('./routes/jobs');
const authenticateUser = require('./middleware/authentication');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	
  }
));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());


app.get('/', (req, res) => { 
  res.send('jobs api');
})


// extra packages

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobRouter); //server will authenticate user everytime user access any of the jobs routes

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
})();

