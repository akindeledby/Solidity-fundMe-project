const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", async function() {
    let fundMe
    let deployer
    let mockV3Aggregator // this is necessary since we are testing on hardhat/local network
    const sendValue = "1000000000000000000" // or we use "ethers.utils.parseEther("1")" which equals 1 ETH
    beforeEach(async function() {
        // deploy our FundMe contract using Hardhat-deploy
        // const accounts = await ethers.getSigners()
        // comst accountZero = account[0] // obtained from the accounts provided by Hardhat
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("fundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function() {
        it("sets the aggregator address correctly", async function() {
            const response = await fundMe.pricefeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    /*describe("receive", async function () {

    })

    describe("fallback", async function () {

    }) */

    describe("fund", async function() {
        it("Fails if you don't send enough ETH", async function() {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )

            it("updates the amount funded data structure", async function() {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.addressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })
            it("adds funder to array of funders", async function() {
                await fundMe.fund({ value: sendValue })
                const funder = await fundMe.funders(0)
                assert.equal(funder, deployer)
            })
        })
    })

    describe("withdraws", async function() {
        beforeEach(async function() {
            // with this, we will firts ensure that there is an amount in the contract beforer it is withdrawn
            await fundMe.fund({ value: sendValue })
        })
        it("withdraws ETH from a single funder", async function() {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice) // we use the mul function because the two values are big number

            // Assert
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
        // Assuming we want to allow withdraw from multiple funders
        it("allows us withdraw from multiple funders", async function() {
            // Arrange
            const accoounts = await ethers.getSigners()
            for (let i = 1; i < 6; 1++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendvalue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice) // we use the mul function because the two values are big number

            // Assert
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            // Make sure that the funders are reset properly
            await expect(fundMe.funders(0)).to.be.reverted
            for (let i = 1; i < 6; 1++) {
                assert.equal(
                    await fundMe.addressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("Only allows the owner to withdraw", async function() {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner")
        })
    })
})
