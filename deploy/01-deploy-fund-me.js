const { networkConfig } = require("../helper-hardhat-config")
const { network, deployments } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccount, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccount()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] We can comment this out
    // to write more codes
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MocksV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = deploy("FundMe", {
        from: deployer, // deployer of the contract which has been declared in the hardhat.config.js file
        args: args, // some arguments will be included here will be price feed address, and some others
        log: true, // this line will help us to be logging the output continuously without needing to be
        // console log it always
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("---------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
/* to prevent hard coding the deployer address, we can do the above "const fundMe = deploy("FundMe") ... 
to dynamically pick address of deployer thus we can use the chainId to do the following from the Aave Github. 
The Aave is a protocol on different chains use to deploy our code on multiple chain using multiple address 
which we will use through the Helper-harhat-config.js. This has variables depending on the network we are 
on. By this, we create a file called Helper-hardhat-config.js */

/* Also, what if we are connecting to a network/Chain that doesn't have a price feed on it? This is when 
we will use what is called "MOCKS" */

/* We will now create MOCK contract where there is only minimum values in it which cam be deployed on a 
network having no pricefeed such as a local network. To do this, we will also create a script called 
"00-deploy-mocks.js" in the deploy folder, then we also create a MOCK  contract in a separate folder in 
the contract folder. */
