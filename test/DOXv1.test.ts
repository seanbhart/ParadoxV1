import {
  ContractFactory,
  Contract,
  ContractReceipt,
  ContractTransaction,
  Event,
} from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Address } from "cluster";
import { BigNumber, Bytes } from "ethers";
import { ethers } from "hardhat";

describe("DOXv1 contract", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  let tokenFactory: ContractFactory;
  let token1: Contract;
  let token2: Contract;
  let token3: Contract;
  let doxFactory: ContractFactory;
  let dox: Contract;

  var account2 = ethers.Wallet.createRandom();

  before(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    // console.log("Created signers. Owner:", owner.address);

    // Deploy the test ERC20 token
    tokenFactory = await ethers.getContractFactory("DOX_ERC20");
    token1 = await tokenFactory.deploy("BASH token", "BASH", owner.address);
    token2 = await tokenFactory.deploy("CASH token", "CASH", owner.address);
    token3 = await tokenFactory.deploy("DASH token", "DASH", owner.address);
    console.log(
      "Deployed tokens: ",
      token1.address,
      token2.address,
      token3.address
    );

    // Deploy the DOX Contract
    doxFactory = await ethers.getContractFactory("DOXv1");
    dox = await doxFactory.deploy(
      token1.address,
      token2.address,
      token3.address
    );
    console.log("Deployed DOX");

    // Approve and transfer 100 from ERC20 to DOX contract
    await token1.approve(dox.address, 1000000);
    await dox.deposit(token1.address, 1000000);
    console.log(
      "Deployed DOX contract and deposited initial 100 to owner on token1"
    );
  });

  describe("Deployment", function () {
    it("Should have set the right owner", async function () {
      expect(await dox.owner()).to.equal(owner.address);
    });
  });

  // describe("Swap2", async function () {
  //   for (let i = 0; i < 5; i++) {
  //     it("Should have swapped token1 for token2", async function () {
  //       await dox.swap(
  //         owner.address,
  //         token1.address,
  //         token2.address,
  //         token3.address,
  //         100000
  //       );
  //       const bal1 = await dox.getBook(owner.address, token1.address);
  //       const bal2 = await dox.getBook(owner.address, token2.address);
  //       console.log(
  //         "post-swap balances: ",
  //         BigNumber.from(bal1).toString(),
  //         BigNumber.from(bal2).toString()
  //       );
  //       expect(1).to.equal(1);
  //     });
  //   }
  // });

  describe("Swap", async function () {
    var token1bal = 1000000;
    var token2bal = 1000000;
    let k = token1bal * token2bal;

    var bal1last = 1000000;
    var bal2last = 0;
    let swapAmt = 100000;

    for (let i = 0; i < 7; i++) {
      it("Should have swapped token1 for token2", async function () {
        await dox.swap(owner.address, token1.address, token2.address, swapAmt);

        token1bal = token1bal + swapAmt;
        let token2baldiff = token2bal - k / token1bal;
        token2bal = k / token1bal;
        console.log("token calcs: ", token1bal, token2bal, token2baldiff);

        const bal1 = await dox.getBook(owner.address, token1.address);
        const bal2 = await dox.getBook(owner.address, token2.address);
        console.log(
          "post-swap balances: ",
          BigNumber.from(bal1).toString(),
          BigNumber.from(bal2).toString()
        );

        console.log("last balances: ", bal1last, bal2last);
        bal1last = bal1last - swapAmt;
        expect(Math.ceil(bal1)).to.equal(Math.ceil(bal1last));
        bal2last = bal2last + token2baldiff;
        expect(Math.ceil(bal2)).to.equal(Math.ceil(bal2last));
      });
    }
  });

  // describe("Balance", function () {
  //   it("Should have book value of 100 erc20 for sender", async function () {
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(100);
  //   });

  //   it("Should have token balance of 49900 for sender on deployed erc20", async function () {
  //     const balance = await token1.balanceOf(owner.address);
  //     expect(balance).to.equal(49900);
  //   });
  // });

  // describe("Deposit", function () {
  //   it("Should have deposited 100 more for a book value of 200 for sender on erc20", async function () {
  //     await token1.approve(dox.address, 100);
  //     await dox.deposit(token1.address, 100);
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(200);
  //   });
  // });

  // describe("Balance", function () {
  //   it("Should have book value of 200 erc20 for sender", async function () {
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(200);
  //   });

  //   it("Should have token balance of 49800 for sender on deployed erc20", async function () {
  //     const balance = await token1.balanceOf(owner.address);
  //     expect(balance).to.equal(49800);
  //   });
  // });

  // describe("Transfer", function () {
  //   it("Should have transferred 30 from owner", async function () {
  //     await dox.transfer(token1.address, account2.address, 30);
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(170);
  //   });
  //   it("Should have transferred 30 to account2", async function () {
  //     const book = await dox.getBook(account2.address, token1.address);
  //     expect(book).to.equal(30);
  //   });
  // });

  // describe("Mint", function () {
  //   it("Should have minted an ERC20 token with symbol nDASH", async function () {
  //     await dox.mint("nDASH");
  //     const doxOwner = await dox.getTpOwner("nDASH");
  //     expect(doxOwner).to.equal(owner.address);
  //   });
  // });

  // describe("Fill", function () {
  //   it("Should have filled the ERC20 token with 100 erc20", async function () {
  //     await dox.fill("nDASH", token1.address, 100);
  //     const tpBalance = await dox.getTp("nDASH", token1.address);
  //     expect(tpBalance).to.equal(100);
  //   });
  // });

  // describe("Balance", function () {
  //   it("Should have book value of 70 erc20 for sender", async function () {
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(70);
  //   });
  // });

  // describe("Drain", function () {
  //   it("Should have drained the ERC20 token down to 40 erc20", async function () {
  //     await dox.drain("nDASH", token1.address, 60);
  //     const tpBalance = await dox.getTp("nDASH", token1.address);
  //     expect(tpBalance).to.equal(40);
  //   });
  // });

  // describe("Balance", function () {
  //   it("Should have book value of 130 erc20 for sender", async function () {
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(130);
  //   });
  // });

  // describe("Assign", function () {
  //   it("Should have assigned ERC20 token from owner to account2", async function () {
  //     // const ns = Array.from(Array(2000).keys());
  //     // ns.forEach(async (n) => await dox.mint("nDASH" + n));
  //     await dox.assign("nDASH", account2.address);
  //     const tpOwner = await dox.getTpOwner("nDASH");
  //     expect(tpOwner).to.equal(account2.address);
  //   });
  // });

  // describe("Withdraw", function () {
  //   it("Should have withdrawn 100 for sender on erc20", async function () {
  //     await dox.withdraw(token1.address, 100);
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(30);
  //   });
  // });

  // describe("Balance", function () {
  //   it("Should have book value of 30 erc20 for sender", async function () {
  //     const book = await dox.getBook(owner.address, token1.address);
  //     expect(book).to.equal(30);
  //   });

  //   it("Should have token balance of 400 for sender on deployed erc20", async function () {
  //     const balance = await token1.balanceOf(owner.address);
  //     expect(balance).to.equal(400);
  //   });
  // });
});
