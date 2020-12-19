const find = (key) => {
    const text = translations[configs.lang][key]
    if (text)
        return text
    else
        return key
}
module.exports = {find}