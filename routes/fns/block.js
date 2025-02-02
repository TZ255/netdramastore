const blockReq = (req, res) => {
    return res.status(404).render('maintenance.ejs')
}

module.exports = blockReq