const info = (req) => {
    console.log(`${req.pathname} - ${req.method}`);
};

module.exports = info;