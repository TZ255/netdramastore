const detectBettingSites = (c_code) => {
    //betway
    let betways = ["GH", "MW", "NG", "MZ", "ZA", "TZ", "ZM"]
    let india = ["IN"]

    if (betways.includes(c_code)) {
        return 'betway'
    }
    if(india.includes(c_code)) {
        return 'india'
    }
    return '404'
}

module.exports = detectBettingSites