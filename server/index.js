const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const ACCESS_KEYS = config.ACCESS_KEYS;
const IsFunctionalityEnabled = config.IsFunctionalityEnabled;
const PORT = config.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/rest/v2/api/validate", (req, res) => {
    const { accessKey } = req.body;

    const foundKey = ACCESS_KEYS.find((item) => item.key === accessKey);

    if (foundKey) {
        res.status(200).json({
            message: `Access Key accepted! You authorized with ${foundKey.role} role.`,
            isValid: true,
            role: foundKey.role,
        });
    }else {
        res.status(400).json({ message: "Invalid Access Key!", isValid: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});