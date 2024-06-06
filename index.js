const http = require('http');
const fs = require('fs');
const path = require('path');
const requests = require('requests');

const homeFile = fs.readFileSync('home.html', 'utf-8'); // to get access to the home file.

const replaceVal = (tempVal, orgVal) => {
    // Convert temperatures from Kelvin to Celsius
    const tempCelsius = (kelvin) => (kelvin - 273.15).toFixed(2);

    let temperature = tempVal.replace("{%tempmval%}", tempCelsius(orgVal.main.temp));
    temperature = temperature.replace("{%tempmin%}", tempCelsius(orgVal.main.temp_min));
    temperature = temperature.replace("{%tempmax%}", tempCelsius(orgVal.main.temp_max));
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    temperature = temperature.replace("{%tempSts%}", orgVal.weather[0].main);
    return temperature;
}

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        requests(
            'https://api.openweathermap.org/data/2.5/weather?q=Odisha&appid=53e91cdcca685f8b7d1852e0373155e0',
        )
            .on('data', (chunk) => {
                const objData = JSON.parse(chunk);
                const arrData = [objData];
                const realTimeData = arrData.map((val) => replaceVal(homeFile, val)).join(" ");
                res.write(realTimeData);
            })
            .on('end', (err) => {
                if (err) return console.log('connection closed due to errors', err);
                res.end();
            });
    } else {
        // Serve static files
        const filePath = path.join(__dirname, req.url);
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.svg': 'application/image/svg+xml',
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});


const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
    console.log('Server is running on 8000');
});
