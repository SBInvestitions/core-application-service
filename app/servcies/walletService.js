import Web3 from 'web3';
import Accounts from 'web3-eth-accounts';
let web3;

// https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html

if (typeof web3 !== 'undefined') {
  console.log("Web3 detected!");
  web3 = new Web3(web3.currentProvider);
} else {
  console.log("Web3 not detected!");
  // set the provider
  const web3 = new Web3('http://localhost:8545');
}

const walletService = () => {
  // console.log('web3', web3, 'Accounts', Accounts);
  web3.eth.accounts.create();
};

export default walletService;