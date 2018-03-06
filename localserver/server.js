const express = require('express');
const app = new express();

app.use(express.static('../site'))

app.listen(3000, () => console.log('Local server listening on port 3000!'))