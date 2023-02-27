
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
            const CarArtifact = data;
            App.contracts.Car = TruffleContract(CarArtifact);

            // Set the provider for our contract
            App.contracts.Car.setProvider(App.web3Provider);
        });




        return await App.ownedCars();

    },

    ownedCars: async () =>{
        try {


            const carInstance = await App.contracts.Car.deployed();
            const account = await web3.eth.getAccounts();
            const carList = await carInstance.getCarsListByOwner({from: account[0]});

            for(let i = 0; i < carList.length; i++) {
                const car = await carInstance.getACarById(carList[i].carId);
                const ethValue = web3.utils.fromWei(carList[i].price, 'ether');
                const item = createCarItem(carList[i].carId,carList[i].name,carList[i].description, carList[i].image,carList[i].price, ethValue, carList[i].used);
                $(".container").append(item);
            }
        } catch (error) {
            console.error(error);
            alert("Error in the car: " + error);
        }


    },

    sellCars : async (carId) => {
        try {

            const carInstance = await App.contracts.Car.deployed();
            const account = await web3.eth.getAccounts();
            await carInstance.sellMyCar(carId,{from: account[0]});
            alert("Messa in vendita!");

        } catch (error) {
            console.error(error);
            alert("Error in the car: " + error);
        }

    }


}

const createCarItem = (carId, carName, carDescription, carImage, carPrice, carPriceEth, used) => {


    const item = ` <div class="card">
    <div class="card__body">
      <img src="../images/${carImage}" style="height: 70px; width : 70px ;border-radius: 50%;">
      <b> <h2 style="color:#654f2d">${carName}</h1> </b>
      <h3>Descrizione</h3>

      <h5>${carDescription}</h5>
      <h5><b>Prezzo: ${carPriceEth} ETH</E></b></h5>
          
          ${used ? '' : '<input type="button" name="sell-button" id="button-sell-' + carId + '" onclick="App.sellCars(' + carId + ')" class="tag tag-brown" value="Sell">'}
       
    </div>
    <div class="card__footer">
    </div>
  </div>`

    return item;
}


$(function() {
    $(window).load(function() {
        App.init();
    });
});

