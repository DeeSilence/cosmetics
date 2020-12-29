const calculateDiscount = (oldPrice, newPrice) => {
    let newValue = ((parseFloat(oldPrice) - parseFloat(newPrice)) / parseFloat(oldPrice)) * 100
    return newValue + '%'
}
module.exports = {calculateDiscount}