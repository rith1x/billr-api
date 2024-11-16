import express from 'express'
import cors from 'cors'
import fs, { write } from 'fs';

const app = express();

app.use(express.json())
const allowedOrigins = ['https://rith1x.github.io', 'http://127.0.0.1:5501', 'http://127.0.0.1:5502'];

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
const port = parseInt(process.env.PORT) || 3001;


app.get('/', (req, res) => {
    res.json({ message: "Hey there, I'm up and running!", service: "running" })
});


function generateId() {
    let id = 'JMF'
    let now = new Date()
    let parsedMetaData = parseMetaData()
    let nowDate = now.getDate()
    if (nowDate !== parsedMetaData.lastDate) {
        parsedMetaData.lastDate = now.getDate()
        parsedMetaData.lastMon = now.getMonth() + 1
        parsedMetaData.lastYear = parseInt(now.getFullYear()) % 100
        parsedMetaData.count = 0
    } else {
        parsedMetaData.count += 1;
    }
    writeMetaData(parsedMetaData)
    id += parsedMetaData.lastYear
    id += (parsedMetaData.lastMon < 10) ? '0' + parsedMetaData.lastMon : parsedMetaData.lastMon
    id += (parsedMetaData.lastDate < 10) ? '0' + parsedMetaData.lastDate : parsedMetaData.lastDate
    id += (parsedMetaData.count == 0) ? '000' : (parsedMetaData.count < 10) ? '00' + parsedMetaData.count : (parsedMetaData.count < 100) ? '0' + parsedMetaData.count : parsedMetaData.count
    return id

}
function parseMetaData() {
    try {
        const data = fs.readFileSync('./metadata.json', 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}
function writeMetaData(data) {
    try {
        fs.writeFileSync('./metadata.json', JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error("Error writing data:", e); // Log the error
        return false;
    }
}

function parseData() {
    try {
        const data = fs.readFileSync('./db.json', 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function writeData(id, data) {
    try {
        let parsed = parseData();
        parsed[id] = data; // Add new data
        fs.writeFileSync('./db.json', JSON.stringify(parsed, null, 2));
        return true;
    } catch (e) {
        console.error("Error writing data:", e); // Log the error
        return false;
    }
}


app.get('/generate', (rq, rs) => {
    console.log("Cello")
    let id = generateId()
    rs.json({ id: id })
})



app.post('/bill', (rq, rs) => {
    let data = rq.body
    console.log(data)
    let billNo = data.billId

    if (writeData(billNo, data)) {
        rs.json({ msg: "Success" })
    } else {
        rs.json({ msg: "Failed" })
    }
})


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});