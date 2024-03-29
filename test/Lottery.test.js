const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const compiledContract = require('../compile');
const interface = compiledContract.abi;
const bytecode = compiledContract.evm.bytecode.object;

let lottery;
let accounts;


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(interface)
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' })
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: '100'
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: '100'
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: '100'
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: '100'
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);

        assert.equal(3, players.length);
    });


    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: '2'
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('only manager can call pick winner', async () => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('send money to the winner and reset the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: '2000'
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const accountBalance = await web3.eth.getBalance(accounts[0]);

        assert.notEqual(initialBalance, accountBalance);
    })
})