const fs = require('fs');

const requestHandler = (req, res) => {

    const url = req.url;
    const method = req.method;

    res.setHeader('Content-Type', 'text/html');
    
    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Enter Message</title></head>')
        res.write(
            '<body><form action="/message" method="POST" ><input name="message" type="text"><button type="submit">Send</button></form></body>'
        )
        res.write('</html>');
        return res.end();
    }

    if (url === '/message' && method === 'POST') {

        const body = [];

        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });

        //below nodejs will do eventually, but at moment it basically move to the next code sync without any wait (behind the scene)

        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];

            // fs.writeFileSync('message.txt', message); // here, it's sync block execution of the next line code until done.

            //or

            fs.writeFile('message.txt', message, err => {

                res.statusCode = 302; //redirect
                res.setHeader('Location', '/');

                return res.end();
            })
        });

    }

    res.write('<html>');
    res.write('<head><title>My First Page</title></head>')
    res.write('<body><h1>Hello!</h1></body>')
    res.write('</html>');
    res.end();
};

module.exports = {
    handler: requestHandler,
    someText: 'Some hard coded text', 
}