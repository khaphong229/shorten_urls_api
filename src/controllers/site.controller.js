class SiteController {
    home(req, res) {
        res.json({ info: 'Node.js, Express, and Postgres API' });
    }
}

module.exports = new SiteController();
