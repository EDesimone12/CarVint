    AppHeader = {

        web3Provider: null,
        contracts: {},

        init: async () => {
            return await AppHeader.initWeb3();
        },

        initWeb3: async () => {
            // Modern dapp browsers...
            if (window.ethereum) {
                AppHeader.web3Provider = window.ethereum;
                try {
                // Request account access
                await window.ethereum.request({ method: "eth_requestAccounts" });;
                } catch (error) {
                // User denied account access...
                console.error("User denied account access")
                }
            }
            // Legacy dapp browsers...
            else if (window.web3) {
                AppHeader.web3Provider = window.web3.currentProvider;
            }
            // If no injected web3 instance is detected, fall back to Ganache
            else {
                AppHeader.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            }
            web3 = new Web3(AppHeader.web3Provider);

            return await AppHeader.initContract();
        },

        initContract: async () => {
            await $.getJSON('../build/contracts/Car.json', function(data) {
                // Get the necessary contract artifact file and instantiate it with @truffle/contract
                const CarArtifact = data;
                AppHeader.contracts.Car = TruffleContract(CarArtifact);

                // Set the provider for our contract
                AppHeader.contracts.Car.setProvider(AppHeader.web3Provider);
            });


        }

    }

$(function() {
    $(window).load(function() {
        AppHeader.init();
    });
});

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    //document.getElementById("header").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    //document.getElementById("header").style.marginLeft= "0";
};
