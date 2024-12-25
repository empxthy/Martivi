    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const app = express();

    const ACCESS_KEY = process.env.ACCESS_KEY.split(',');
    const PORT = process.env.PORT || 3000;

    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send("Hello, World!");
    })

    app.post('/rest/v2/api/validate', (req, res) => {
        const { accessKey } = req.body;

        console.log(accessKey);

        if (ACCESS_KEY.includes(accessKey)) {
            res.status(200).json({ message: "Access Key accepted!", isValid: true })
        } else {
            return res.status(400).json({ message: "Invalid Access Key!", isValid: false });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });