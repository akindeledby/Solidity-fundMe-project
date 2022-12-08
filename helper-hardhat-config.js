const networkConfig = {
    4: {
        name: "goerli",
        ethUsdPriceFeed: "" || "" // enter pricefeed address here
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "" || "" // enter pricefeed address here
    }
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 2000000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
}
