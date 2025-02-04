const app = require('../src/app');
const port = 3000

app.listen(3000, '0.0.0.0', () => {
    console.log('Server is listening on port ' + port);
});