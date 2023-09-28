const express = require('express');

const router = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/', router);
app.use('/users', router);
app.use('/status', router);
app.use('/stats', router);
app.use('/files', router);
app.use('/files/:id', router);
app.use('/files/:id/publish', router);
app.use('/files/:id/unpublish', router);
app.use('/files/:id/data', router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
