const calculateDiscount = (oldPrice, newPrice) => {
    if (!newPrice)
        return null
    let newValue = Math.round(((parseFloat(oldPrice) - parseFloat(newPrice)) / parseFloat(oldPrice)) * 100)
    return newValue + '%'
}
module.exports = {calculateDiscount}