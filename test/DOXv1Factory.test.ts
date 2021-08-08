import { ContractFactory, Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Address } from "cluster";
import { ethers } from "hardhat";

describe("TokenFactory contract", function () {
  // `before`, `beforeEach`, `after`, `afterEach`.

  let cctFactoryFactory: ContractFactory;
  let cctFactory: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  before(async function () {
    // Get the ContractFactory and Signers here.
    cctFactoryFactory = await ethers.getContractFactory("CCTv1Factory");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    cctFactory = await cctFactoryFactory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await cctFactory.owner()).to.equal(owner.address);
    });
  });

  describe("CreateToken", () => {
    let token: Contract;
    it("Should deploy new Token contract", async () => {
      console.log("create Token");
      await cctFactory.createToken("gToken");
      const tokenAddress = await cctFactory.tokenList(0);
      expect(tokenAddress).to.not.undefined;

      console.log("instantiate Token contract object");
      token = await ethers.getContractAt("CCTv1WETH", tokenAddress);
      expect(token.address).to.not.equal("");
    });
  });
});
