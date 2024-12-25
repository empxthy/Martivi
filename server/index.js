const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const allowedOrigin = ['91.151.136.183'];

app.use(bodyParser.json(), cors());

app.post('api/validate', (req, res) => {
    const { domain } = req.body;

    console.log(domain);

    if(allowedOrigin.includes(domain)) {
        return res.status(200).json({message: "Hello, from Express!"});
    }
});

app.listen(PORT, () => {
    console.log(`Server running in ${PORT} port!`);
});