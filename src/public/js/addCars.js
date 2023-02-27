let value;

App = {

    web3Provider: null,
    contracts: {},

    init: async () => {
        return await App.initWeb3();
    },

    initWeb3: async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
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
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return await App.initContract();
    },

    initContract: async () => {
        await $.getJSON('../build/contracts/Car.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            const carArtifact = data;
            App.contracts.Car = TruffleContract(carArtifact);

            // Set the provider for our contract
            App.contracts.Car.setProvider(App.web3Provider);
        });
    },

    addCar: async (name,price, description,image) => {
        let carInstance;

        await web3.eth.getAccounts(function(error, accounts) {

            if (error) {
                console.log(error);
            }

            const account = accounts[0];
            App.contracts.Car.deployed().then(function(instance) {
                let weiPrice = Web3.utils.toWei(String(price), 'ether');
                carInstance = instance;
                return carInstance.addCar( name,weiPrice, description, image, {from:account});
            }).then(function(result) {
                alert("Add Car!!!!!!");
                console.log(result);
            }).catch(function(err) {
                alert("Error in the car" + err)
            });

        });

    }

}

$(function() {
    $(window).load(function() {
        App.init();
        $("#add_car").click(async () => {

            const name = $("#car_name").val();
            const description = $("#car_description").val();
            const price = $("#car_price").val();
            const type = $("#cars_type").val();


            if (name == '' || description == '' || price == '' || type == '') {
                toast.error("Error in input fields...");
            } else {
                await App.addCar(name, price, description, type);
            }

        });
    });
});
