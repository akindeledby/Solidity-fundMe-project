const { contract } = require("ethers")
const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == "31337") {
        // or we can use if (developmentChains.includes(network.name)) { ... }
        log("local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            Contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })
        log("Mocks Deployed!")
        log("---------------------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
