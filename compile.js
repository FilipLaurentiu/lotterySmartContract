const path = require('path');
const fs = require('fs');
const solc = require('solc');

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');


var jsonContractSource = {
    language: 'Solidity',
    sources: {
        'Lottery': {
            content: source,
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
}

compiledContract = JSON.parse(solc.compile(JSON.stringify(jsonContractSource)));
module.exports = compiledContract.contracts.Lottery.Lottery;

